import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReserveInventoryForOrderCommand } from './reserve-inventory-for-order.command';
import { Inject } from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import { InsufficientInventoryAvailableException } from 'src/core/domain/inventory/exception/insufficient-inventory-available.aggregate';
import { OrderInventoryReservationFailedEvent } from '../../event/order-inventory-reservation-failed.event';
import { OrderInventoryReservedEvent } from '../../event/order-inventory-reserved.event';
import {
  DISTRIBUTED_LOCK_SERVICE,
  IDistributedLockService,
} from 'src/core/application/port/distributed-lock.interface';

@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  private readonly LOCK_TIMEOUT_MS = 5000;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 200;

  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(DISTRIBUTED_LOCK_SERVICE)
    private readonly distributedLockService: IDistributedLockService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReserveInventoryForOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;
    const acquiredLocks: Array<{ lockId: string; lockName: string }> = [];

    try {
      const inventories = await this.inventoryRepository.findAllByProductId(
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

      await this.inventoryRepository.persistMany(inventories);
      this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
    } catch (error) {
      if (error instanceof InsufficientInventoryAvailableException) {
        this.eventBus.publish(
          new OrderInventoryReservationFailedEvent(orderId),
        );
      }
    }
  }
}
