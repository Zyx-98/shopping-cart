import { AggregateRoot } from '@nestjs/cqrs';
import { PaymentId } from '../value-object/payment-id.vo';
import { Price } from '../../shared/domain/value-objects/price.vo';
import { PaymentState } from '../states/payment-state.state';

export class PaymentAggregate extends AggregateRoot {
  private _paymentId: PaymentId;
  private _state: PaymentState;
  private _totalItemPrice: Price;
  private _failedAt: Date | null;
  private _paidAt: Date | null;

  constructor(
    paymentId: PaymentId,
    state: PaymentState,
    totalItemPrice: Price,
    failedAt: Date | null,
    paidAt: Date | null,
  ) {
    super();
    this._paymentId = paymentId;
    this._state = state;
    this._totalItemPrice = totalItemPrice;
    this._failedAt = failedAt;
    this._paidAt = paidAt;
  }

  get paymentId(): PaymentId {
    return this._paymentId;
  }

  get state(): string {
    return this._state.getStateValue();
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

  setState(state: PaymentState): void {
    this._state = state;
  }
}
