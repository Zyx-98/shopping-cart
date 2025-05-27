import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { PaymentState } from '../enum/payment-state.enum';

export interface IPaymentState {
  state: PaymentState;
  open(payment: PaymentAggregate): void;
  pay(payment: PaymentAggregate): void;
  fail(payment: PaymentAggregate): void;
  cancel(payment: PaymentAggregate): void;
}
