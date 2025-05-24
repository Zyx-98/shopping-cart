import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderAsCompleteCommand } from './mark-order-as-complete.command';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { Inject } from '@nestjs/common';

@CommandHandler(MarkOrderAsCompleteCommand)
export class MarkOrderAsCompleteHandler
  implements ICommandHandler<MarkOrderAsCompleteCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: MarkOrderAsCompleteCommand): Promise<void> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error(`Order with ID ${orderId.toString()} not found`);
    }

    order.completeOrder();

    await this.orderRepository.persist(order);
  }
}
