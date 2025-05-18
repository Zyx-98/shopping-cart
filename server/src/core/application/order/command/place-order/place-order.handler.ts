import { Inject } from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repository/product.repository';
import { PlaceOrderCommand } from './place-order.command';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<PlaceOrderCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    const { customerId, selectedProducts } = command;

    const aggregate = OrderAggregate.create(customerId, selectedProducts);

    await this.orderRepository.persist(aggregate);
  }
}
