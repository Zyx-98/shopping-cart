import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class ProductReservationSucceededForOrderEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly nextOrderLine: {
      productId: string;
      quantity: number;
    },
  ) {}
}
