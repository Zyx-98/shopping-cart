import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class MarkOrderAsFailCommand {
  constructor(public readonly orderId: OrderId) {}
}
