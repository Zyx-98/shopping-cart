import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';

export class MarkAsPaidCommand {
  constructor(
    public readonly paymentId: PaymentId,
    public readonly orderId: OrderId,
  ) {}
}
