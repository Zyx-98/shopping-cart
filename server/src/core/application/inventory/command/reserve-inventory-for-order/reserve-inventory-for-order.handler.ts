import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReserveInventoryForOrderCommand } from './reserve-inventory-for-order.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { OrderInventoryReservationFailedEvent } from '../../event/order-inventory-reservation-failed.event';
import { OrderInventoryReservedEvent } from '../../event/order-inventory-reserved.event';
import {
  DISTRIBUTED_LOCK_SERVICE,
  IDistributedLockService,
} from 'src/core/application/port/distributed-lock.interface';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { InsufficientInventoryAvailableException } from 'src/core/domain/inventory/exception/insufficient-inventory-available.aggregate';

@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  private readonly LOCK_TIMEOUT_MS = 5000;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 200;

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(DISTRIBUTED_LOCK_SERVICE)
    private readonly distributedLockService: IDistributedLockService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReserveInventoryForOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;
    const acquiredLocks: Array<{ lockId: string; lockName: string }> = [];
    await this.unitOfWork.beginTransaction();

    const { inventoryRepository, sagaInstanceRepository } = this.unitOfWork;

    const sagaInstance =
      await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
        orderId,
      );

    if (!sagaInstance) {
      throw new NotFoundException(
        `Cannot reserve inventory: No saga instance found for orderId: ${orderId.toValue()} `,
      );
    }

    try {
      const inventories = await inventoryRepository.findAllByProductId(
        orderLines.map((line) => line.productId),
      );

      for (const inventory of inventories) {
        const lockName = `inventory_lock:${inventory.id.toString()}`;

        const lockId = await this.distributedLockService.acquire(
          lockName,
          this.LOCK_TIMEOUT_MS,
          this.RETRY_ATTEMPTS,
          this.RETRY_DELAY_MS,
        );

        if (!lockId) {
          for (const acquiredLock of acquiredLocks) {
            await this.distributedLockService.release(
              acquiredLock.lockName,
              acquiredLock.lockId,
            );
          }

          sagaInstance.advanceStep(
            OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED,
          );

          await sagaInstanceRepository.persist(sagaInstance);

          this.eventBus.publish(
            new OrderInventoryReservationFailedEvent(orderId),
          );

          return;
        }

        acquiredLocks.push({
          lockName,
          lockId,
        });

        const orderLine = orderLines.find((line) =>
          line.productId.equals(inventory.productId),
        );
        if (orderLine) {
          inventory.removeQuantity(orderLine.quantity);
        }
      }

      await inventoryRepository.persistMany(inventories);

      sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_RESERVED);

      await sagaInstanceRepository.persist(sagaInstance);

      await this.unitOfWork.commitTransaction();
      this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
    } catch (error) {
      if (error instanceof InsufficientInventoryAvailableException) {
        sagaInstance.advanceStep(
          OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED,
        );
        await sagaInstanceRepository.persist(sagaInstance);
        this.eventBus.publish(
          new OrderInventoryReservationFailedEvent(orderId),
        );

        await this.unitOfWork.commitTransaction();
      } else {
        await this.unitOfWork.rollbackTransaction();
      }
    }
  }
}
