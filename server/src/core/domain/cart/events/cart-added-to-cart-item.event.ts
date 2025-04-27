import { ProductId } from '../../product/value-objects/product-id.vo';
import { IDomainEvent } from '../../shared/domain/events/domain-event.interface';
import { Price } from '../../shared/domain/value-objects/price.vo';
import { Quantity } from '../../shared/domain/value-objects/quantity.vo';
import { CartId } from '../value-objects/cart-id.vo';

export class CartAddedToCartItemEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly cartId: CartId;
  public readonly productId: ProductId;
  public readonly quantity: Quantity;
  public readonly price: Price;

  constructor(
    cartId: CartId,
    productId: ProductId,
    quantity: Quantity,
    price: Price,
  ) {
    this.dateTimeOccurred = new Date();
    this.cartId = cartId;
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }

  getAggregateId(): CartId {
    return this.cartId;
  }
}
