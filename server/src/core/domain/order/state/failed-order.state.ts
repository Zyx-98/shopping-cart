import { OrderState } from '../enum/order-state.enum';
import { OrderStateTransitionException } from '../exception/order-state-transition.exception';
import { IOrderState } from './order.state';

export class FailedOrderState implements IOrderState {
  public state = OrderState.FAILED;

  markAsAwaitPayment(): void {
    throw new OrderStateTransitionException(
      this.state,
      OrderState.AWAITING_PAYMENT,
    );
  }

  public complete(): void {
    throw new OrderStateTransitionException(this.state, OrderState.COMPLETED);
  }
  public cancel(): void {
    throw new OrderStateTransitionException(this.state, OrderState.CANCELED);
  }
  public fail(): void {
    throw new OrderStateTransitionException(this.state, OrderState.FAILED);
  }
}
