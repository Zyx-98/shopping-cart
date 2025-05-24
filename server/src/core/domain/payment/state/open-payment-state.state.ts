import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { PaymentState } from '../enum/payment-state.enum';
import { PaymentAlreadyInStateException } from '../exception/payment-already-in-state-exception.exception';
import { FailedPaymentState } from './failed-payment-state.state';
import { PaidPaymentState } from './paid-payment-state.state';
import { IPaymentState } from './payment-state.state';

export class OpenPaymentState implements IPaymentState {
  public state = PaymentState.OPEN;

  public open(): void {
    throw new PaymentAlreadyInStateException(this.state);
  }

  public pay(payment: PaymentAggregate): void {
    payment.setState(new PaidPaymentState());
    payment.setPaidAt(new Date());
  }

  public fail(payment: PaymentAggregate): void {
    payment.setState(new FailedPaymentState());
    payment.setFailedAt(new Date());
  }
}
