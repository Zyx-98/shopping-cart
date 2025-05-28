import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';

export class InitiatePaymentCommand {
  constructor(
    public readonly orderId: OrderId,
    public readonly totalItemPrice: Price,
  ) {}
}
