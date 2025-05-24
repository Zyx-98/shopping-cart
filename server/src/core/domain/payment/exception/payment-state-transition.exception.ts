import { PaymentState } from '../enum/payment-state.enum';

export class PaymentStateTransitionException extends Error {
  constructor(
    fromState: PaymentState,
    toState: PaymentState,
    message?: string,
  ) {
    super(
      message || `Cannot transition payment from ${fromState} to ${toState}.`,
    );
    this.name = 'PaymentStateTransitionException';
  }
}
