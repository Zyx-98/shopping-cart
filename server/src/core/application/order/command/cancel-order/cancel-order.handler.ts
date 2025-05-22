import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from './cancel-order.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const { orderId, customerId } = command;

    const order = await this.orderRepository.findBelongToCustomerById(
      orderId,
      customerId,
    );

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId.toString()} not found`,
      );
    }

    order.cancelOrder();

    this.publisher.mergeObjectContext(order);

    await this.orderRepository.persist(order);

    order.commit();
  }
}
