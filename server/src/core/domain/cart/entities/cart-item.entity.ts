import { ProductId } from '../../product/value-objects/product-id.vo';
import { Price } from '../../shared/domain/value-objects/price.vo';
import { Quantity } from '../../shared/domain/value-objects/quantity.vo';
import { CartId } from '../value-objects/cart-id.vo';
import { CartItemId } from '../value-objects/cart-item-id.vo';

export class CartItem {
  private _cartItemId: CartItemId;
  private _cartId: CartId;
  private readonly _productId: ProductId;
  private _quantity: Quantity;
  private readonly _priceAtAddition: Price;

  constructor(
    cartItemId: CartItemId | null,
    productId: ProductId,
    quantity: Quantity,
    cartId: CartId,
    price: Price,
  ) {
    this._cartItemId = cartItemId || CartItemId.create();
    this._cartId = cartId;
    this._productId = productId;
    this._quantity = quantity;
    this._priceAtAddition = price;
  }

  get productId(): ProductId {
    return this._productId;
  }
  get quantity(): Quantity {
    return this._quantity;
  }
  get priceAtAddition(): Price {
    return this._priceAtAddition;
  }

  public increaseQuantity(amount: Quantity): void {
    this._quantity = this._quantity.add(amount);
  }

  public changeQuantity(quantity: Quantity): void {
    this._quantity = quantity;
  }

  public calculateSubtotal(): Price {
    const subtotalAmount = this._priceAtAddition.amount * this._quantity.value;

    return Price.create(subtotalAmount, this._priceAtAddition.currency);
  }

  public equals(item?: CartItem): boolean {
    if (item === null || item === undefined) {
      return false;
    }

    return this._productId.equals(item._productId);
  }
}
