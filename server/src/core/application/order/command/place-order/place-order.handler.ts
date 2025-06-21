import { Inject, Logger } from '@nestjs/common';
import { PlaceOrderCommand } from './place-order.command';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaInstance } from 'src/core/domain/saga/entity/saga-instance.entity';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<PlaceOrderCommand> {
  private readonly logger: Logger = new Logger(PlaceOrderHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<{ uuid: string }> {
    const { customerId, selectedProducts } = command;
    await this.unitOfWork.beginTransaction();

    try {
      const { productRepository, orderRepository, sagaInstanceRepository } =
        this.unitOfWork;

      const products = await productRepository.findAllByIds(
        selectedProducts.map((p) => p.productId),
      );

      const aggregate = OrderAggregate.create(
        customerId,
        selectedProducts.map((selectedProduct) => {
          const productIndex = products.findIndex((p) =>
            p.id.equals(selectedProduct.productId),
          );

          const priceAtTimeOfOrder =
            productIndex !== -1
              ? products[productIndex].price
              : Price.create(0);

          if (productIndex !== -1) {
            products.splice(productIndex, 1);
          }

          return {
            ...selectedProduct,
            priceAtTimeOfOrder,
          };
        }),
      );

      const order = await orderRepository.persist(aggregate);

      this.publisher.mergeObjectContext(aggregate);

      const sagaInstance = SagaInstance.create(
        SagaType.PLACE_ORDER,
        aggregate.id,
        {
          customerId: aggregate.customerId.toString(),
          orderLines: aggregate.orderLines.map((orderLine) => ({
            productId: orderLine.productId.toValue(),
            quantity: orderLine.quantity.value,
          })),
          totalPrice: aggregate.getTotalPrice().amount,
          orderId: aggregate.id.toValue(),
        },
        OrderProcessingSagaStep.INITIATED,
      );

      await sagaInstanceRepository.persist(sagaInstance);

      await this.unitOfWork.commitTransaction();

      this.logger.log(
        `Order placed successfully with ID: ${order.id.toString()}`,
      );

      aggregate.commit();
      return { uuid: order.id.toString() };
    } catch (error) {
      this.logger.error(
        'Failed to place order',
        error instanceof Error ? error.stack : String(error),
      );

      await this.unitOfWork.rollbackTransaction();
      throw new Error(
        'Failed to place order: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
}
