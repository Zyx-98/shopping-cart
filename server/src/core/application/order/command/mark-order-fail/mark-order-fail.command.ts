import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class MarkOrderFailCommand {
  constructor(public readonly orderId: OrderId) {}
}
