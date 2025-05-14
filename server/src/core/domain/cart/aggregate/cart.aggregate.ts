import { CartId } from '../value-object/cart-id.vo';
import { CartItem } from '../entity/cart-item.entity';
import { CustomerId } from '../../customer/value-object/customer-id.vo';
import { ProductId } from '../../product/value-object/product-id.vo';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { ProductNotInCartException } from '../exception/product-not-in-cart-exception';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';
// import { CartInitializedEvent } from '../event/cart-initialized.event';
// import { CartAddedToCartItemEvent } from '../event/cart-added-to-cart-item.event';
// import { CartItemRemovedFromCartEvent } from '../event/cart-item-removed-from-cart-event.event';
// import { CartItemQuantityUpdatedEvent } from '../event/cart-item-quantity-updated.event';

export interface CartProps {
  id: CartId;
  cartItems: CartItem[];
  customerId: CustomerId;
  createdAt: Date;
  updatedAt: Date;
}

export class CartAggregate extends BaseAggregateRoot<CartId> {
  private _cartId: CartId;
  private _cartItems: CartItem[] = [];
  private _customerId: CustomerId;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CartProps) {
    super(props.id);
    this._cartItems = props.cartItems;
    this._customerId = props.customerId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get cartItems(): ReadonlyArray<CartItem> {
    return Object.freeze([...this._cartItems]);
  }

  public static reconstitute(props: CartProps): CartAggregate {
    return new CartAggregate(props);
  }

  public static initializeCart(customerId: CustomerId): CartAggregate {
    const cart = new CartAggregate({
      id: CartId.create(),
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
        this._cartId,
        productId,
        quantity,
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
