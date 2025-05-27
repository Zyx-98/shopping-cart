import { PaymentAggregate } from '../aggregate/payment.aggregate';
import { PaymentState } from '../enum/payment-state.enum';
import { PaymentAlreadyInStateException } from '../exception/payment-already-in-state-exception.exception';
import { CanceledPaymentState } from './caneled-payment.state';
import { FailedPaymentState } from './failed-payment.state';
import { PaidPaymentState } from './paid-payment.state';
import { IPaymentState } from './payment.state';

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

  public cancel(payment: PaymentAggregate): void {
    payment.setState(new CanceledPaymentState());
  }
}
