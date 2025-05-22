import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderAsFailCommand } from './mark-order-as-fail.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';

@CommandHandler(MarkOrderAsFailCommand)
export class MarkOrderAsFailHandler
  implements ICommandHandler<MarkOrderAsFailCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: MarkOrderAsFailCommand): Promise<void> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId.toString()} not found`,
      );
    }

    order.markAsFail();

    await this.orderRepository.persist(order);
  }
}
