import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';
import { OrderStateTransitionException } from '../exception/order-state-transition.exception';
import { AwaitingPaymentOrderState } from './awaiting-payment-order.state';
import { CanceledOrderState } from './canceled-order.state';
import { FailedOrderState } from './failed-order.state';
import { IOrderState } from './order.state';

export class PendingOrderState implements IOrderState {
  markAsAwaitPayment(order: OrderAggregate): void {
    order.setState(new AwaitingPaymentOrderState());
  }
  public state = OrderState.PENDING;

  public complete(): void {
    throw new OrderStateTransitionException(this.state, OrderState.COMPLETED);
  }
  public cancel(order: OrderAggregate): void {
    order.setCanceledAt(new Date());
    order.setState(new CanceledOrderState());
  }
  public fail(order: OrderAggregate): void {
    order.setState(new FailedOrderState());
  }
}
