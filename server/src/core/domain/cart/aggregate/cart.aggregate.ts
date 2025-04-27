import { AggregateRoot } from '@nestjs/cqrs';
import { CartId } from '../value-objects/cart-id.vo';
import { CartItem } from '../entities/cart-item.entity';
import { CustomerId } from '../../customer/value-objects/customer-id.vo';
import { ProductId } from '../../product/value-objects/product-id.vo';
import { Quantity } from '../../shared/domain/value-objects/quantity.vo';
import { Price } from '../../shared/domain/value-objects/price.vo';
import { ProductNotInCartException } from '../exceptions/product-not-in-cart-exception';
// import { CartInitializedEvent } from '../events/cart-initialized.event';
// import { CartAddedToCartItemEvent } from '../events/cart-added-to-cart-item.event';
// import { CartItemRemovedFromCartEvent } from '../events/cart-item-removed-from-cart-event.event';
// import { CartItemQuantityUpdatedEvent } from '../events/cart-item-quantity-updated.event';

interface CartProps {
  cartId: CartId;
  cartItems: CartItem[];
  customerId: CustomerId;
  createdAt: Date;
  updatedAt: Date;
}

export class CartAggregate extends AggregateRoot {
  private _cartId: CartId;
  private _cartItems: CartItem[] = [];
  private _customerId: CustomerId;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CartProps) {
    super();
    this._cartId = props.cartId;
    this._cartItems = props.cartItems;
    this._customerId = props.customerId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get cartId(): CartId {
    return this._cartId;
  }

  get cartItems(): ReadonlyArray<CartItem> {
    return Object.freeze([...this._cartItems]);
  }

  public initializeCart(customerId: CustomerId): CartAggregate {
    const cart = new CartAggregate({
      cartId: CartId.create(),
      cartItems: [],
      customerId: customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Raise CartInitializedEvent
    // cart.apply(new CartInitializedEvent(cart._cartId, customerId));

    return cart;
  }

  public addCartItem(
    productId: ProductId,
    quantity: Quantity,
    price: Price,
  ): void {
    const existingCartItemIndex = this._cartItems.findIndex((item) =>
      item.productId.equals(productId),
    );

    if (existingCartItemIndex > -1) {
      const exitingCartItem = this._cartItems[existingCartItemIndex];
      exitingCartItem.increaseQuantity(quantity);
      this._updatedAt = new Date();
    } else {
      const newItem = new CartItem(
        null,
        productId,
        quantity,
        this._cartId,
        price,
      );
      this._cartItems.push(newItem);
      this._updatedAt = new Date();
    }

    // Raise event after successful addition/update
    // this.apply(
    //   new CartAddedToCartItemEvent(this._cartId, productId, quantity, price),
    // );
  }

  public removeCartItem(productId: ProductId): void {
    const initialLength = this._cartItems.length;

    this._cartItems = this._cartItems.filter(
      (item) => !item.productId.equals(productId),
    );

    if (this._cartItems.length === initialLength) {
      throw new ProductNotInCartException(productId);
    }
    this._updatedAt = new Date();
    // Raise ItemRemovedFromCartEvent
    // this.apply(new CartItemRemovedFromCartEvent(this._cartId, productId));
  }

  updateItemQuantity(productId: ProductId, newQuantity: Quantity): void {
    const cartItem = this._cartItems.find((item) =>
      item.productId.equals(productId),
    );

    if (!cartItem) {
      throw new ProductNotInCartException(productId);
    }

    cartItem.changeQuantity(newQuantity);
    this._updatedAt = new Date();
    // Raise ItemQuantityUpdatedEvent
    // this.apply(
    //   new CartItemQuantityUpdatedEvent(this._cartId, productId, newQuantity),
    // );
  }

  getTotalPrice(): Price {
    const total = this._cartItems.reduce((sum, cartItem) => {
      return sum + cartItem.calculateSubtotal().amount;
    }, 0);

    const currency =
      this._cartItems.length > 0
        ? this._cartItems[0].priceAtAddition.currency
        : 'USD';

    return Price.create(total, currency);
  }
}
