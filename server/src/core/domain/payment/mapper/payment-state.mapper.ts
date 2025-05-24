import { PaymentState } from '../enum/payment-state.enum';
import { FailedPaymentState } from '../state/failed-payment-state.state';
import { OpenPaymentState } from '../state/open-payment-state.state';
import { PaidPaymentState } from '../state/paid-payment-state.state';
import { IPaymentState } from '../state/payment-state.state';

export class PaymentStateMapper {
  static mapToState(state: string): IPaymentState {
    switch (state as PaymentState) {
      case PaymentState.OPEN:
        return new OpenPaymentState();
      case PaymentState.PAID:
        return new PaidPaymentState();
      case PaymentState.FAILED:
        return new FailedPaymentState();
      default:
        throw new Error(`Unknown payment state`);
    }
  }
}
