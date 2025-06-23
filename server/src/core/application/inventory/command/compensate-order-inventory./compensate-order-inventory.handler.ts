import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompensateOrderInventoryCommand } from './compensate-order-inventory.command';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import {
  DISTRIBUTED_LOCK_SERVICE,
  IDistributedLockService,
} from 'src/core/application/port/distributed-lock.interface';

@CommandHandler(CompensateOrderInventoryCommand)
export class CompensateOrderInventoryHandler
  implements ICommandHandler<CompensateOrderInventoryCommand>
{
  private readonly logger = new Logger(CompensateOrderInventoryHandler.name);

  private readonly LOCK_TIMEOUT_MS = 5000;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 200;
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(DISTRIBUTED_LOCK_SERVICE)
    private readonly distributedLockService: IDistributedLockService,
  ) {}

  async execute(command: CompensateOrderInventoryCommand): Promise<void> {
    const { orderId, products } = command;
    let acquiredLocks: Array<{ lockId: string; lockName: string }> = [];
    const lockNames = products.map(
      (product) => `compensate_inventory_lock:${product?.productId.toString()}`,
    );

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
    } else {
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
            `Cannot compensate inventory: No saga instance not found for orderId: ${orderId.toValue()}`,
          );
        }

        for (const product of products) {
          const inventory = await inventoryRepository.findByUniqueId(
            product?.productId,
          );

          if (!inventory) {
            this.logger.error(
              `Inventory not found for product: ${product?.productId.toString()}`,
            );
            throw new NotFoundException(
              `Inventory not found for product: ${product?.productId.toString()}`,
            );
          }

          inventory.addQuantity(product.quantity);

          await inventoryRepository.persist(inventory);
        }

        sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);
        await sagaInstanceRepository.persist(sagaInstance);
      });
    }

    for (const acquiredLock of acquiredLocks) {
      await this.distributedLockService.release(
        acquiredLock.lockName,
        acquiredLock.lockId,
      );
    }
  }
}
