import { OrderId } from '../../order/value-object/order-id.vo';
import { PaymentId } from '../value-object/payment-id.vo';

export class PaymentPaidEvent {
  constructor(
    public readonly paymentId: PaymentId,
    public readonly orderId: OrderId,
  ) {}
}
