import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveInventoryForCreatedOrderCommand } from './remove-inventory-for-created-order.command';
import { Inject } from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import { InsufficientInventoryAvailableException } from 'src/core/domain/inventory/exception/insufficient-inventory-available.aggregate';
import { InsufficientInventoryAvailableForCreatedOrderEvent } from '../../event/insufficient-inventory-available-for-created-order.event';
import { CommittedInventoryForCreatedOrderEvent } from '../../event/committed-inventory-for-created-order.event';

@CommandHandler(RemoveInventoryForCreatedOrderCommand)
export class RemoveInventoryForCreatedOrderHandler
  implements ICommandHandler<RemoveInventoryForCreatedOrderCommand>
{
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveInventoryForCreatedOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;

    try {
      const inventories = await this.inventoryRepository.findManyByProductId(
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
      this.eventBus.publish(
        new CommittedInventoryForCreatedOrderEvent(orderId),
      );
    } catch (error) {
      if (error instanceof InsufficientInventoryAvailableException) {
        this.eventBus.publish(
          new InsufficientInventoryAvailableForCreatedOrderEvent(orderId),
        );
      }
    }
  }
}
