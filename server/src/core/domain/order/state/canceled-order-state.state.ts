import { OrderState } from '../enum/order-state.enum';
import { OrderStateTransitionException } from '../exception/order-state-transition.exception';
import { IOrderState } from './order-state.state';

export class CanceledOrderState implements IOrderState {
  public state = OrderState.CANCELED;

  public complete(): void {
    throw new OrderStateTransitionException(this.state, OrderState.COMPLETED);
  }
  public cancel(): void {
    throw new OrderStateTransitionException(this.state, OrderState.CANCELED);
  }
}
