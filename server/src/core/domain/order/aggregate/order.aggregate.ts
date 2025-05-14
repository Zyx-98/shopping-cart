import { OrderId } from '../value-object/order-id.vo';
import { CartId } from '../../cart/value-object/cart-id.vo';
import { CouponId } from '../../coupon/value-objects/coupon-id.vo';
import { IOrderState } from '../state/order-state.state';
import { OrderLine } from '../entity/order-line.entity';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';
import { CustomerId } from '../../customer/value-object/customer-id.vo';

export interface OrderProps {
  id: OrderId;
  cartId: CartId;
  customerId: CustomerId;
  couponId: CouponId | null;
  orderLines: OrderLine[];
  state: IOrderState;
  invoicePath?: string | null;
  canceledAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderAggregate extends BaseAggregateRoot<OrderId> {
  private _customerId: CustomerId;
  private _couponId: CouponId | null;
  private _orderLines: OrderLine[];
  private _state: IOrderState;
  private _invoicePath?: string | null;
  private _canceledAt?: Date | null;
  private _completedAt?: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OrderProps) {
    super(props.id);
    this._customerId = props.customerId;
    this._couponId = props.couponId;
    this._state = props.state;
    this._invoicePath = props.invoicePath;
    this._canceledAt = props.canceledAt;
    this._completedAt = props.completedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get couponId(): CouponId | null {
    return this._couponId;
  }

  get state(): string {
    return this._state.state;
  }

  get invoicePath(): string | null | undefined {
    return this._invoicePath;
  }

  get canceledAt(): Date | null | undefined {
    return this._canceledAt;
  }

  get completedAt(): Date | null | undefined {
    return this._completedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get orderLines(): OrderLine[] {
    return this._orderLines;
  }

  setState(state: IOrderState): void {
    this._state = state;
  }
}
