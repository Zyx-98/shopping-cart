import { PaymentId } from '../value-object/payment-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { IPaymentState } from '../state/payment-state.state';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';
import { OrderId } from '../../order/value-object/order-id.vo';
import { OpenPaymentState } from '../state/open-payment-state.state';
import { PaymentFailedEvent } from '../event/payment-failed.event';
import { PaymentPaidEvent } from '../event/payment-paid.event';

export interface PaymentProps {
  id: PaymentId;
  orderId: OrderId;
  state: IPaymentState;
  totalItemPrice: Price;
  failedAt: Date | null;
  paidAt: Date | null;
}

export class PaymentAggregate extends BaseAggregateRoot<PaymentId> {
  private _state: IPaymentState;
  private _orderId: OrderId;
  private _totalItemPrice: Price;
  private _failedAt: Date | null;
  private _paidAt: Date | null;

  constructor(props: PaymentProps) {
    super(props.id);
    this._state = props.state;
    this._orderId = props.orderId;
    this._totalItemPrice = props.totalItemPrice;
    this._failedAt = props.failedAt;
    this._paidAt = props.paidAt;
  }

  public static create(
    orderId: OrderId,
    totalItemPrice: Price,
  ): PaymentAggregate {
    return new PaymentAggregate({
      id: PaymentId.create(),
      orderId,
      state: new OpenPaymentState(),
      totalItemPrice,
      failedAt: null,
      paidAt: null,
    });
  }

  public static reconstitute(props: PaymentProps): PaymentAggregate {
    return new PaymentAggregate(props);
  }

  get state(): string {
    return this._state.state;
  }

  get orderId(): OrderId {
    return this._orderId;
  }

  get totalItemPrice(): Price {
    return this._totalItemPrice;
  }

  get failedAt(): Date | null {
    return this._failedAt;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }

  setState(state: IPaymentState): void {
    this._state = state;
  }

  setPaidAt(date: Date): void {
    this._paidAt = date;
  }

  setFailedAt(date: Date): void {
    this._failedAt = date;
  }

  public markAsPaid(): void {
    this._state.pay(this);
    this.apply(new PaymentPaidEvent(this.id, this.orderId));
  }

  public markAsFailed(): void {
    this._state.fail(this);
    this.apply(new PaymentFailedEvent(this.id, this.orderId));
  }
}
