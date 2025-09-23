import { OrderLine } from 'src/core/domain/order/entity/order-line.entity';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class ReservedInventoryForOrderV2Command {
  constructor(
    public readonly orderId: OrderId,
    public readonly orderLine: Pick<OrderLine, 'productId' | 'quantity'>,
  ) {}
}
