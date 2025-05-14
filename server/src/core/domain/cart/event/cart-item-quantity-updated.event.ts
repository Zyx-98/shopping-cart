import { ProductId } from '../../product/value-object/product-id.vo';
import { IDomainEvent } from '../../shared/domain/event/domain-event.interface';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { CartId } from '../value-object/cart-id.vo';

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
