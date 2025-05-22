import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderFailCommand } from './mark-order-fail.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';

@CommandHandler(MarkOrderFailCommand)
export class MarkOrderFailHandler
  implements ICommandHandler<MarkOrderFailCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: MarkOrderFailCommand): Promise<void> {
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
