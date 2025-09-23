import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';

export class ProductReservationSucceededForOrderEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly nextOrderLine: {
      productId: ProductId;
      quantity: Quantity;
    },
  ) {}
}
