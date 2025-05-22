import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryCommittedCommand } from './inventory-committed.commad';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';

@CommandHandler(InventoryCommittedCommand)
export class InventoryCommittedHandler
  implements ICommandHandler<InventoryCommittedCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: InventoryCommittedCommand): Promise<any> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId.toString()} not found`,
      );
    }

    order?.markAsAwaitPayment();

    await this.orderRepository.persist(order);
  }
}
