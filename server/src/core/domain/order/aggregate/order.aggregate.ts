import { OrderId } from '../value-object/order-id.vo';
import { CouponId } from '../../coupon/value-objects/coupon-id.vo';
import { IOrderState } from '../state/order-state.state';
import { OrderLine, OrderLineProps } from '../entity/order-line.entity';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';
import { CustomerId } from '../../customer/value-object/customer-id.vo';
import { OrderException } from '../exception/order.exception';
import { PendingOrderState } from '../state/pending-order-state.state';
import { OrderState } from '../enum/order-state.enum';

export interface OrderProps {
  id: OrderId;
  customerId: CustomerId;
  couponId?: CouponId | null;
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
  private _couponId?: CouponId | null;
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

  public static create(
    customerId: CustomerId,
    orderLinesData: Array<
      Omit<OrderLineProps, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>
    >,
    couponId?: CouponId | null,
  ): OrderAggregate {
    const orderId = OrderId.create();

    if (!orderLinesData || orderLinesData.length === 0) {
      throw new OrderException('Order must have at least one line item.');
    }

    const orderLines = orderLinesData.map((lineData) =>
      OrderLine.create(
        orderId,
        lineData.productId,
        lineData.productId.toString(),
        lineData.quantity.value,
      ),
    );

    const props: OrderProps = {
      id: orderId,
      customerId,
      couponId,
      orderLines,
      state: new PendingOrderState(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const order = new OrderAggregate(props);

    return order;
  }

  public static reconstitute(props: OrderProps): OrderAggregate {
    return new OrderAggregate(props);
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get couponId(): CouponId | null | undefined {
    return this._couponId;
  }

  get orderLines(): OrderLine[] {
    return this._orderLines;
  }

  get state(): OrderState {
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

  public completeOrder(): void {
    this._state.complete(this);
    this._updatedAt = new Date();
  }

  public cancelOrder(): void {
    this._state.cancel(this);
    this._updatedAt = new Date();
  }

  public setCompletedAt(date: Date): void {
    this._completedAt = date;
  }

  public setCanceledAt(date: Date): void {
    this._canceledAt = date;
  }

  public setState(state: IOrderState): void {
    this._state = state;
  }

  public setInvoicePath(path: string): void {
    if (this.state === OrderState.CANCELED) {
      throw new OrderException('Cannot set invoice path for a canceled order.');
    }
    this._invoicePath = path;
    this._updatedAt = new Date();
  }
}
