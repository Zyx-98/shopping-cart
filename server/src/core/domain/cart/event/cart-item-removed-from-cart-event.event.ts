import { ProductId } from '../../product/value-object/product-id.vo';
import { IDomainEvent } from '../../shared/domain/event/domain-event.interface';
import { CartId } from '../value-object/cart-id.vo';

export class CartItemRemovedFromCartEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly cartId: CartId;
  public readonly productId: ProductId;

  constructor(cartId: CartId, productId: ProductId) {
    this.dateTimeOccurred = new Date();
    this.cartId = cartId;
    this.productId = productId;
  }

  getAggregateId(): CartId {
    return this.cartId;
  }
}
