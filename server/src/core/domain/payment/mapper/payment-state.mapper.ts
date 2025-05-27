import { PaymentState } from '../enum/payment-state.enum';
import { CanceledPaymentState } from '../state/caneled-payment.state';
import { FailedPaymentState } from '../state/failed-payment.state';
import { OpenPaymentState } from '../state/open-payment.state';
import { PaidPaymentState } from '../state/paid-payment.state';
import { IPaymentState } from '../state/payment.state';

export class PaymentStateMapper {
  static mapToState(state: string): IPaymentState {
    switch (state as PaymentState) {
      case PaymentState.OPEN:
        return new OpenPaymentState();
      case PaymentState.PAID:
        return new PaidPaymentState();
      case PaymentState.FAILED:
        return new FailedPaymentState();
      case PaymentState.CANCELED:
        return new CanceledPaymentState();
      default:
        throw new Error(`Unknown payment state`);
    }
  }
}
