import { OrderAggregate } from '../aggregate/order.aggregate';
import { CanceledOrderState } from './canceled-order-state.state';
import { CompletedOrderState } from './completed-order-state.state';
import { OrderState } from './order-state.state';

export class PendingOrderState extends OrderState {
  protected value = 'pending';

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
