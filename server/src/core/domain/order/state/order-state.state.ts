import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';

export interface IOrderState {
  state: OrderState;
  complete(order: OrderAggregate): void;
  cancel(order: OrderAggregate): void;
}
