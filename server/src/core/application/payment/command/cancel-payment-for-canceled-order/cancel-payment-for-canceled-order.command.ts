import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class CancelPaymentForCanceledOrderCommand {
  constructor(public readonly orderId: OrderId) {}
}
