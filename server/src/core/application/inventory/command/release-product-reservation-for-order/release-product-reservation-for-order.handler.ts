import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseProductReservationForOrderCommand } from './release-product-reservation-for-order.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { ReleasedProductReservationForOrderEvent } from '../../event/released-product-reservation-for-order.event';
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

@CommandHandler(ReleaseProductReservationForOrderCommand)
export class ReleaseProductReservationForOrderHandler
  implements ICommandHandler<ReleaseProductReservationForOrderCommand>
{
  private readonly logger: Logger = new Logger(
    ReleaseProductReservationForOrderHandler.name,
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

  async execute(
    command: ReleaseProductReservationForOrderCommand,
  ): Promise<void> {
    const { orderId } = command;

    const sagaInstance =
      await this.sagaInstanceRepository.findByCorrelationId(orderId);

    if (!sagaInstance) {
      throw new NotFoundException(
        `Cannot release inventory: No saga instance found for orderId: ${orderId.toValue()}`,
      );
    }

    const reservedOrderLines = sagaInstance.getSuccessFullyReservedOrderLines();

    if (reservedOrderLines.length === 0) {
      this.logger.warn(
        `No reserved items to compensate for order ${orderId.toValue()}`,
      );
    } else {
      const compensationTasks = reservedOrderLines.map(
        ({ productId, quantity }) => {
          const cacheKey = `inventory:product:${productId}`;
          this.logger.log(
            `Compensating ${quantity} for product ${productId} in Redis.`,
          );
          return this.cacheService.compensateInventory(cacheKey, quantity);
        },
      );

      await Promise.all(compensationTasks);
    }

    sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);

    await this.sagaInstanceRepository.persist(sagaInstance);

    for (const orderLine of reservedOrderLines) {
      await this.queueService.addJob(
        QueueType.INVENTORY,
        QueueJobName.COMPENSATE_INVENTORY,
        {
          productId: orderLine.productId,
          quantity: orderLine.quantity,
        },
      );
    }

    this.eventBus.publish(new ReleasedProductReservationForOrderEvent(orderId));
  }
}
