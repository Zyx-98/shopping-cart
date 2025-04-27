import { ProductId } from '../../product/value-objects/product-id.vo';
import { IDomainEvent } from '../../shared/domain/events/domain-event.interface';
import { Quantity } from '../../shared/domain/value-objects/quantity.vo';
import { CartId } from '../value-objects/cart-id.vo';

export class CartItemQuantityUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly cartId: CartId;
  public readonly productId: ProductId;
  public readonly quantity: Quantity;

  constructor(cartId: CartId, productId: ProductId, quantity: Quantity) {
    this.dateTimeOccurred = new Date();
    this.cartId = cartId;
    this.productId = productId;
    this.quantity = quantity;
  }
  getAggregateId(): CartId {
    return this.cartId;
  }
}
