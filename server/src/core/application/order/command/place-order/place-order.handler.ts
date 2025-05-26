import { Inject } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { PlaceOrderCommand } from './place-order.command';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repository/product.repository';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<PlaceOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<{ uuid: string }> {
    const { customerId, selectedProducts } = command;

    const products = await this.productRepository.findAllByIds(
      selectedProducts.map((p) => p.productId),
    );

    const aggregate = OrderAggregate.create(
      customerId,
      selectedProducts.map((selectedProduct) => {
        const productIndex = products.findIndex((p) =>
          p.id.equals(selectedProduct.productId),
        );

        const priceAtTimeOfOrder =
          productIndex !== -1 ? products[productIndex].price : Price.create(0);

        if (productIndex !== -1) {
          products.splice(productIndex, 1);
        }

        return {
          ...selectedProduct,
          priceAtTimeOfOrder,
        };
      }),
    );

    const order = await this.orderRepository.persist(aggregate);

    this.publisher.mergeObjectContext(aggregate);

    aggregate.commit();

    return { uuid: order.id.toString() };
  }
}
