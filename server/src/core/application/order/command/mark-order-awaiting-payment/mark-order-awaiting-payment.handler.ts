import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderAwaitingPaymentCommand } from './mark-order-awaiting-payment.commad';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';

@CommandHandler(MarkOrderAwaitingPaymentCommand)
export class MarkOrderAwaitingPaymentHandler
  implements ICommandHandler<MarkOrderAwaitingPaymentCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: MarkOrderAwaitingPaymentCommand): Promise<any> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId.toString()} not found`,
      );
    }

    order.markAsAwaitPayment();

    await this.orderRepository.persist(order);
  }
}
