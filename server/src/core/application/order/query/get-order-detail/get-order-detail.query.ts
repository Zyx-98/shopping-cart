import { Query } from '@nestjs/cqrs';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class GetOrderDetailQuery extends Query<OrderAggregate> {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
  ) {
    super();
  }
}
