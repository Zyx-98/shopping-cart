import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import { CompensateOrderInventoryCommand } from './compensate-order-inventory.command';

@CommandHandler(CompensateOrderInventoryCommand)
export class CompensateOrderInventoryHandler
  implements ICommandHandler<CompensateOrderInventoryCommand>
{
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(command: CompensateOrderInventoryCommand): Promise<void> {
    const { products } = command;

    const inventories = await this.inventoryRepository.findAllByProductId(
      products.map((product) => product.productId),
    );

    for (const inventory of inventories) {
      const product = products.find((product) =>
        product.productId.equals(inventory.productId),
      );
      if (product) {
        inventory.addQuantity(product.quantity);
      }
    }

    await this.inventoryRepository.persistMany(inventories);
  }
}
