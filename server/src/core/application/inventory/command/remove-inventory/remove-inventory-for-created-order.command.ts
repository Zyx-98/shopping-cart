import { OrderLine } from 'src/core/domain/order/entity/order-line.entity';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class RemoveInventoryForCreatedOrderCommand {
  constructor(
    public readonly orderId: OrderId,
    public readonly orderLines: OrderLine[],
  ) {}
}
