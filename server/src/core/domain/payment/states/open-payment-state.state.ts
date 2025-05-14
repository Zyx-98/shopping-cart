import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { PaymentState } from '../enum/payment-state.enum';
import { FailedPaymentState } from './failed-payment-state.state';
import { PaidPaymentState } from './paid-payment-state.state';
import { IPaymentState } from './payment-state.state';

export class OpenPaymentState implements IPaymentState {
  public state = PaymentState.OPEN;

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
