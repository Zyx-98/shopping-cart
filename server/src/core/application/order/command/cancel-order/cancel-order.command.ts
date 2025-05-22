import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class CancelOrderCommand {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
  ) {}
}
