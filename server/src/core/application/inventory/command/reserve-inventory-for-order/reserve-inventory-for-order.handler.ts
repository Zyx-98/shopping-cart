import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReserveInventoryForOrderCommand } from './reserve-inventory-for-order.command';
import {
  Inject,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
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

@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  private readonly logger = new Logger(ReserveInventoryForOrderHandler.name);

  private readonly LOCK_TIMEOUT_MS = 2000;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 500;

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(DISTRIBUTED_LOCK_SERVICE)
    private readonly distributedLockService: IDistributedLockService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReserveInventoryForOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;
    let acquiredLocks: Array<{ lockId: string; lockName: string }> = [];
    const lockNames = orderLines.map(
      (orderLine) => `product_lock:${orderLine.productId.toString()}`,
    );

    try {
      const lockPromises = lockNames.map((lockName) =>
        this.distributedLockService.acquire(
          lockName,
          this.LOCK_TIMEOUT_MS,
          this.RETRY_ATTEMPTS,
          this.RETRY_DELAY_MS,
        ),
      );

      const lockIds = await Promise.all(lockPromises);

      if (lockIds.some((lockId) => !lockId)) {
        acquiredLocks = lockIds.filter(Boolean).map((lockId, index) => ({
          lockId: lockId!,
          lockName: lockNames[index],
        }));

        this.logger.error(`Failed to acquire lock for inventory`);

        throw new PreconditionFailedException(
          `Failed to acquire lock for inventory`,
        );
      }

      acquiredLocks = lockIds.map((lockId, index) => ({
        lockId: lockId!,
        lockName: lockNames[index],
      }));

      await this.unitOfWork.execute(async () => {
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

        const inventories = await inventoryRepository.findAllByProductId(
          orderLines.map((line) => line.productId),
        );

        for (const inventory of inventories) {
          this.logger.log(
            `Reserving inventory for product: ${inventory.productId.toString()}`,
          );

          const orderLine = orderLines.find((line) =>
            line.productId.equals(inventory.productId),
          );

          if (orderLine) {
            this.logger.log(
              `Reserving ${orderLine.quantity.value} units of inventory for product: ${inventory.productId.toString()}`,
            );

            inventory.removeQuantity(orderLine.quantity);
          }
        }

        await inventoryRepository.persistMany(inventories);

        sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_RESERVED);

        await sagaInstanceRepository.persist(sagaInstance);

        this.logger.log(
          `Inventory reservation successful for order ID: ${orderId.toValue()}`,
        );
        this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
      });
    } catch (error) {
      this.logger.error(
        `Failed to reserve inventory for order with ID ${orderId.toValue()}`,
      );

      await this.unitOfWork.execute(async () => {
        const { sagaInstanceRepository } = this.unitOfWork;

        const sagaInstance =
          await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
            orderId,
          );

        if (sagaInstance) {
          sagaInstance.advanceStep(
            OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED,
          );
          await sagaInstanceRepository.persist(sagaInstance);
        }
      });

      this.eventBus.publish(new OrderInventoryReservationFailedEvent(orderId));

      throw error;
    } finally {
      for (const acquiredLock of acquiredLocks) {
        await this.distributedLockService.release(
          acquiredLock.lockName,
          acquiredLock.lockId,
        );
      }
    }
  }
}
