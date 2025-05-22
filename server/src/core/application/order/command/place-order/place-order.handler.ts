import { Inject } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { PlaceOrderCommand } from './place-order.command';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<PlaceOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<{ uuid: string }> {
    const { customerId, selectedProducts } = command;

    const aggregate = OrderAggregate.create(customerId, selectedProducts);

    const order = this.publisher.mergeObjectContext(
      await this.orderRepository.persist(aggregate),
    );

    order.applyCreatedEvent();

    order.commit();

    return { uuid: order.id.toString() };
  }
}
