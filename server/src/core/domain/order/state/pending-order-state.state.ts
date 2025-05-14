import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';
import { CanceledOrderState } from './canceled-order-state.state';
import { CompletedOrderState } from './completed-order-state.state';
import { IOrderState } from './order-state.state';

export class PendingOrderState implements IOrderState {
  public state = OrderState.PENDING;

  public complete(order: OrderAggregate): void {
    order.setCompletedAt(new Date());
    order.setState(new CompletedOrderState());
  }
  public cancel(order: OrderAggregate): void {
    order.setCanceledAt(new Date());
    order.setState(new CanceledOrderState());
  }
}
