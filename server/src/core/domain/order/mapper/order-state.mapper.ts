import { OrderState } from '../enum/order-state.enum';
import { AwaitingPaymentOrderState } from '../state/awaiting-payment-order.state';
import { CanceledOrderState } from '../state/canceled-order.state';
import { CompletedOrderState } from '../state/completed-order.state';
import { FailedOrderState } from '../state/failed-order.state';
import { IOrderState } from '../state/order.state';
import { PendingOrderState } from '../state/pending-order.state';

export class OrderStateMapper {
  static mapToOrderState(state: string): IOrderState {
    switch (state as OrderState) {
      case OrderState.PENDING:
        return new PendingOrderState();
      case OrderState.COMPLETED:
        return new CompletedOrderState();
      case OrderState.CANCELED:
        return new CanceledOrderState();
      case OrderState.FAILED:
        return new FailedOrderState();
      case OrderState.AWAITING_PAYMENT:
        return new AwaitingPaymentOrderState();
      default:
        throw new Error(`Unknown order state`);
    }
  }
}
