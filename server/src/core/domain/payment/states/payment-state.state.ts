import { PaymentAggregate } from '../aggregate/payment.aggregate';

export abstract class PaymentState {
  protected abstract value: string;

  public getStateValue(): string {
    return this.value;
  }

  abstract open(payment: PaymentAggregate): void;
  abstract pay(payment: PaymentAggregate): void;
  abstract fail(payment: PaymentAggregate): void;
}
