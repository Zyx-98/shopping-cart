import { PaymentId } from '../value-object/payment-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { IPaymentState } from '../states/payment-state.state';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

export interface PaymentProps {
  id: PaymentId;
  state: IPaymentState;
  totalItemPrice: Price;
  failedAt: Date | null;
  paidAt: Date | null;
}

export class PaymentAggregate extends BaseAggregateRoot<PaymentId> {
  private _state: IPaymentState;
  private _totalItemPrice: Price;
  private _failedAt: Date | null;
  private _paidAt: Date | null;

  constructor(props: PaymentProps) {
    super(props.id);
    this._state = props.state;
    this._totalItemPrice = props.totalItemPrice;
    this._failedAt = props.failedAt;
    this._paidAt = props.paidAt;
  }

  get state(): string {
    return this._state.state;
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
}
