import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';
import { OrderStateTransitionException } from '../exception/order-state-transition.exception';
import { CanceledOrderState } from './canceled-order.state';
import { CompletedOrderState } from './completed-order.state';
import { FailedOrderState } from './failed-order.state';
import { IOrderState } from './order.state';

export class AwaitingPaymentOrderState implements IOrderState {
  state: OrderState = OrderState.AWAITING_PAYMENT;
  complete(order: OrderAggregate): void {
    order.setCompletedAt(new Date());
    order.setState(new CompletedOrderState());
  }
  cancel(order: OrderAggregate): void {
    order.setCanceledAt(new Date());
    order.setState(new CanceledOrderState());
  }
  fail(order: OrderAggregate): void {
    order.setState(new FailedOrderState());
  }
  markAsAwaitPayment(): void {
    throw new OrderStateTransitionException(
      this.state,
      OrderState.AWAITING_PAYMENT,
    );
  }
}
