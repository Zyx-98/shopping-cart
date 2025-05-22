import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderDetailQuery } from './get-order-detail.query';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';

@QueryHandler(GetOrderDetailQuery)
export class GetOrderDetailHandler
  implements IQueryHandler<GetOrderDetailQuery>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetOrderDetailQuery): Promise<OrderAggregate> {
    const { orderId, customerId } = query;

    const order = await this.orderRepository.findBelongToCustomerById(
      orderId,
      customerId,
    );

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId.toString()} not found`,
      );
    }

    return order;
  }
}
