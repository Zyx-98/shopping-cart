import { PaymentState } from '../enum/payment-state.enum';
import { IPaymentState } from './payment-state.state';

export class PaidPaymentState implements IPaymentState {
  public state = PaymentState.PAID;

  public open(): void {
    throw new Error('Payment is already paid');
  }

  public pay(): void {
    throw new Error('Payment is already paid');
  }

  public fail(): void {
    throw new Error('Payment is already paid');
  }
}
