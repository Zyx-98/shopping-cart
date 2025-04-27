import { ProductId } from '../../product/value-objects/product-id.vo';
import { IDomainEvent } from '../../shared/domain/events/domain-event.interface';
import { CartId } from '../value-objects/cart-id.vo';

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
