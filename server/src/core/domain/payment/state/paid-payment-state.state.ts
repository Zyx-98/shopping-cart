import { PaymentState } from '../enum/payment-state.enum';
import { PaymentAlreadyInStateException } from '../exception/payment-already-in-state-exception.exception';
import { PaymentStateTransitionException } from '../exception/payment-state-transition.exception';
import { IPaymentState } from './payment-state.state';

export class PaidPaymentState implements IPaymentState {
  public state = PaymentState.PAID;

  public open(): void {
    throw new PaymentStateTransitionException(this.state, PaymentState.OPEN);
  }

  public pay(): void {
    throw new PaymentAlreadyInStateException(this.state);
  }

  public fail(): void {
    throw new PaymentStateTransitionException(this.state, PaymentState.FAILED);
  }
}
