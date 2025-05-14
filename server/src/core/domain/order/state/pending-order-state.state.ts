import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';
import { CanceledOrderState } from './canceled-order-state.state';
import { CompletedOrderState } from './completed-order-state.state';
import { IOrderState } from './order-state.state';

export class PendingOrderState implements IOrderState {
  public state = OrderState.PENDING;

  public pending(): void {
    throw new Error('Order is already pending');
  }
  public completed(order: OrderAggregate): void {
    order.setState(new CompletedOrderState());
  }
  public canceled(order: OrderAggregate): void {
    order.setState(new CanceledOrderState());
  }
}
