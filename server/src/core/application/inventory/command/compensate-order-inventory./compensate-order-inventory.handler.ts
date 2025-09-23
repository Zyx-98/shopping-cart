import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CompensateOrderInventoryCommand } from './compensate-order-inventory.command';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { CompensatedInventoryForOrderEvent } from '../../event/compensated-inventory-for-order.event';
import { SagaInstanceRepository } from 'src/infrastructure/persistence/typeorm/repositories/saga-instance.repository';
import {
  CACHE_SERVICE,
  ICacheService,
} from 'src/core/application/port/cache.interface';
import { SAGA_INSTANCE_REPOSITORY } from 'src/core/domain/saga/repository/saga-instance.repository';
import {
  IQueueService,
  QUEUE_SERVICE,
  QueueJobName,
  QueueType,
} from 'src/core/application/port/queue.service';

@CommandHandler(CompensateOrderInventoryCommand)
export class CompensateOrderInventoryHandler
  implements ICommandHandler<CompensateOrderInventoryCommand>
{
  private readonly logger = new Logger(CompensateOrderInventoryHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(SAGA_INSTANCE_REPOSITORY)
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
  ) {}

  async execute(command: CompensateOrderInventoryCommand): Promise<void> {
    const { orderId, products } = command;

    const compensationTasks = products.map((product) => {
      const cacheKey = `inventory:product:${product.productId.toValue()}`;
      this.logger.log(
        `Compensating ${product.quantity.value} for product ${product.productId.toValue()} in Redis.`,
      );
      return this.cacheService.compensateInventory(
        cacheKey,
        product.quantity.value,
      );
    });

    await Promise.all(compensationTasks);

    const sagaInstance =
      await this.sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
        orderId,
      );

    if (!sagaInstance) {
      throw new NotFoundException(
        `Cannot compensate inventory: No saga instance not found for orderId: ${orderId.toValue()}`,
      );
    }

    sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);
    await this.sagaInstanceRepository.persist(sagaInstance);

    for (const product of products) {
      await this.queueService.addJob(
        QueueType.INVENTORY,
        QueueJobName.COMPENSATE_INVENTORY,
        {
          productId: product.productId.toValue(),
          quantity: product.quantity.value,
        },
      );
    }

    this.eventBus.publish(new CompensatedInventoryForOrderEvent(orderId));
  }
}
