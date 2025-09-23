import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReservedInventoryForOrderV2Command } from './reserve-inventory-for-order-v2.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { ProductReservationSucceededForOrderEvent } from '../../event/product-reservation-succeeded-for-order.event';
import { OrderInventoryReservedEvent } from '../../event/order-inventory-reserved.event';
import { OrderInventoryReservationFailedEvent } from '../../event/order-inventory-reservation-failed.event';
import {
  CACHE_SERVICE,
  ICacheService,
} from 'src/core/application/port/cache.interface';
import { SagaInstanceRepository } from 'src/infrastructure/persistence/typeorm/repositories/saga-instance.repository';
import { SAGA_INSTANCE_REPOSITORY } from 'src/core/domain/saga/repository/saga-instance.repository';
import {
  IQueueService,
  QUEUE_SERVICE,
  QueueJobName,
  QueueType,
} from 'src/core/application/port/queue.service';

@CommandHandler(ReservedInventoryForOrderV2Command)
export class ReservedInventoryForOrderV2Handler
  implements ICommandHandler<ReservedInventoryForOrderV2Command>
{
  private readonly logger: Logger = new Logger(
    ReservedInventoryForOrderV2Handler.name,
  );

  constructor(
    private readonly eventBus: EventBus,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    @Inject(SAGA_INSTANCE_REPOSITORY)
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
  ) {}

  async execute(command: ReservedInventoryForOrderV2Command): Promise<void> {
    const { orderId, orderLine } = command;
    const cacheKey = `inventory:product:${orderLine.productId.toString()}`;

    try {
      const newStockLevel = await this.cacheService.reserveInventory(
        cacheKey,
        orderLine.quantity.value,
      );

      if (newStockLevel < 0) {
        this.eventBus.publish(
          new OrderInventoryReservationFailedEvent(orderId),
        );

        return;
      }

      const sagaInstance =
        await this.sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(`
               Cannot reserve inventory: No saga instance found for orderId: ${orderId.toValue()} 
        `);
      }

      sagaInstance.markLineAsReserve({
        productId: orderLine.productId.toValue(),
        quantity: orderLine.quantity.value,
      });

      const nextOrderLine = sagaInstance.getNextLineToReserve();

      const sagaStep = nextOrderLine
        ? OrderProcessingSagaStep.INVENTORY_RESERVING
        : OrderProcessingSagaStep.INVENTORY_RESERVED;

      sagaInstance.advanceStep(sagaStep);

      await this.sagaInstanceRepository.persist(sagaInstance);

      await this.queueService.addJob(
        QueueType.INVENTORY,
        QueueJobName.RESERVE_INVENTORY,
        {
          productId: orderLine.productId.toValue(),
          quantity: orderLine.quantity.value,
        },
      );

      if (!nextOrderLine) {
        this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
      } else {
        this.eventBus.publish(
          new ProductReservationSucceededForOrderEvent(orderId, nextOrderLine),
        );
      }
    } catch (error) {
      await this.cacheService.compensateInventory(
        cacheKey,
        orderLine.quantity.value,
      );

      this.eventBus.publish(new OrderInventoryReservationFailedEvent(orderId));
      throw error;
    }
  }
}
