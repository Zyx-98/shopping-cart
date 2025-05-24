import { PaymentState } from '../enum/payment-state.enum';

export class PaymentAlreadyInStateException extends Error {
  constructor(state: PaymentState) {
    super(`Payment is already in state: ${state}.`);
    this.name = 'PaymentAlreadyInStateException';
  }
}
