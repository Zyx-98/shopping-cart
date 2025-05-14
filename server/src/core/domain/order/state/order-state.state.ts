import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderState } from '../enum/order-state.enum';

export interface IOrderState {
  state: OrderState;
  pending(order: OrderAggregate): void;
  completed(order: OrderAggregate): void;
  canceled(order: OrderAggregate): void;
}
