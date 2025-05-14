import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { PaymentState } from '../enum/payment-state.enum';
import { OpenPaymentState } from './open-payment-state.state';
import { PaidPaymentState } from './paid-payment-state.state';
import { IPaymentState } from './payment-state.state';

export class FailedPaymentState implements IPaymentState {
  public state = PaymentState.FAILED;

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
