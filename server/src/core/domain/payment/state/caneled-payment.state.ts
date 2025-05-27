import { PaymentState } from '../enum/payment-state.enum';
import { PaymentAlreadyInStateException } from '../exception/payment-already-in-state-exception.exception';
import { PaymentStateTransitionException } from '../exception/payment-state-transition.exception';
import { IPaymentState } from './payment.state';

export class CanceledPaymentState implements IPaymentState {
  public state = PaymentState.CANCELED;

  public open(): void {
    throw new PaymentStateTransitionException(this.state, PaymentState.OPEN);
  }

  public pay(): void {
    throw new PaymentStateTransitionException(this.state, PaymentState.PAID);
  }

  public fail(): void {
    throw new PaymentStateTransitionException(this.state, PaymentState.FAILED);
  }

  public cancel(): void {
    throw new PaymentAlreadyInStateException(this.state);
  }
}
