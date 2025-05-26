import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderDetailQuery } from './get-order-detail.query';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { OrderMapper } from '../../mapper/order.mapper';
import { OrderDetailDto } from '../../dto/order-detail.dto';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repository/product.repository';

@QueryHandler(GetOrderDetailQuery)
export class GetOrderDetailHandler
  implements IQueryHandler<GetOrderDetailQuery>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly orderMapper: OrderMapper,
  ) {}

  async execute(query: GetOrderDetailQuery): Promise<OrderDetailDto> {
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

    const products = await this.productRepository.findAllByIds(
      order.orderLines.map((p) => p.productId),
    );

    return this.orderMapper.toDto(order, products);
  }
}
