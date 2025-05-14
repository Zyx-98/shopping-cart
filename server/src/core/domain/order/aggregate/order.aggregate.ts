import { AggregateRoot } from '@nestjs/cqrs';
import { OrderId } from '../value-object/order-id.vo';
import { CartId } from '../../cart/value-object/cart-id.vo';
import { CouponId } from '../../coupon/value-objects/coupon-id.vo';
import { OrderState } from '../state/order-state.state';

export class OrderAggregate extends AggregateRoot {
  private _orderId: OrderId;
  private _cartId: CartId;
  private _couponId: CouponId;

  private _state: OrderState;
  private _invoicePath: string;
  private _canceledAt: Date | null;
  private _completedAt: Date | null;

  constructor(
    orderId: OrderId,
    cartId: CartId,
    couponId: CouponId,
    state: OrderState, // e.g., 'pending', 'completed', 'canceled'
    invoicePath: string,
    canceledAt: Date | null,
    completedAt: Date | null,
  ) {
    super();
    this._orderId = orderId;
    this._cartId = cartId;
    this._couponId = couponId;
    this._state = state;
    this._invoicePath = invoicePath;
    this._canceledAt = canceledAt;
    this._completedAt = completedAt;
  }
  get orderId(): OrderId {
    return this._orderId;
  }
  get cartId(): CartId {
    return this._cartId;
  }
  get couponId(): CouponId {
    return this._couponId;
  }
  get state(): string {
    return this._state.getStateValue();
  }
  get invoicePath(): string {
    return this._invoicePath;
  }
  get canceledAt(): Date | null {
    return this._canceledAt;
  }
  get completedAt(): Date | null {
    return this._completedAt;
  }

  setState(state: OrderState): void {
    this._state = state;
  }
}
