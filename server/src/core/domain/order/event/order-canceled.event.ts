import { PaymentId } from '../../payment/value-object/payment-id.vo';
import { OrderLine } from '../entity/order-line.entity';
import { OrderId } from '../value-object/order-id.vo';

export class OrderCanceledEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly orderLines: OrderLine[],
    public readonly paymentId?: PaymentId,
  ) {}
}
