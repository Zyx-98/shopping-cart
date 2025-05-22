import { OrderState } from '../enum/order-state.enum';
import { CanceledOrderState } from '../state/canceled-order-state.state';
import { CompletedOrderState } from '../state/completed-order-state.state';
import { FailedOrderState } from '../state/failed-order-state.state';
import { IOrderState } from '../state/order.state';
import { PendingOrderState } from '../state/pending-order-state.state';

export class OrderStateMapper {
  static mapToOrderState(state: OrderState): IOrderState {
    switch (state) {
      case OrderState.PENDING:
        return new PendingOrderState();
      case OrderState.COMPLETED:
        return new CompletedOrderState();
      case OrderState.CANCELED:
        return new CanceledOrderState();
      case OrderState.FAILED:
        return new FailedOrderState();
      default:
        throw new Error(`Unknown order state`);
    }
  }
}
