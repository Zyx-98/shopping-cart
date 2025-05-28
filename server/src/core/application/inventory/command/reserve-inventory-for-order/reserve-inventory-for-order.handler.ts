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

@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReserveInventoryForOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;

    try {
      const inventories = await this.inventoryRepository.findAllByProductId(
        orderLines.map((line) => line.productId),
      );

      for (const inventory of inventories) {
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
