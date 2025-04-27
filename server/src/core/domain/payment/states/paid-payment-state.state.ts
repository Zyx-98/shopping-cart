import { PaymentState } from './payment-state.state';

export class PaidPaymentState extends PaymentState {
  protected value = 'open';

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
