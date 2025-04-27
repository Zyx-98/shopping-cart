import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { FailedPaymentState } from './failed-payment-state.state';
import { PaidPaymentState } from './paid-payment-state.state';
import { PaymentState } from './payment-state.state';

export class OpenPaymentState extends PaymentState {
  protected value = 'open';

  public open(): void {
    throw new Error('Payment is already open');
  }

  public pay(payment: PaymentAggregate): void {
    payment.setState(new PaidPaymentState());
  }

  public fail(payment: PaymentAggregate): void {
    payment.setState(new FailedPaymentState());
  }
}
