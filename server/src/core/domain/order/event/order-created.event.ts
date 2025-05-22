import { CustomerId } from '../../customer/value-object/customer-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { OrderLine } from '../entity/order-line.entity';
import { OrderId } from '../value-object/order-id.vo';

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly orderLines: OrderLine[],
    public readonly totalAmount: Price,
  ) {}
}
