import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { OpenPaymentState } from './open-payment-state.state';
import { PaidPaymentState } from './paid-payment-state.state';
import { PaymentState } from './payment-state.state';

export class FailedPaymentState extends PaymentState {
  protected value = 'open';

  public open(payment: PaymentAggregate): void {
    payment.setState(new OpenPaymentState());
  }

  public pay(payment: PaymentAggregate): void {
    payment.setState(new PaidPaymentState());
  }

  public fail(): void {
    throw new Error('Payment is already open');
  }
}
