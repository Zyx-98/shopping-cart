import { OrderState } from '../enum/order-state.enum';
import { IOrderState } from './order-state.state';

export class CompletedOrderState implements IOrderState {
  public state = OrderState.COMPLETED;

  public pending(): void {
    throw new Error('Order is already completed');
  }
  public completed(): void {
    throw new Error('Order is already completed');
  }
  public canceled(): void {
    throw new Error('Order is already completed');
  }
}
