import { OrderState } from '../enum/order-state.enum';
import { IOrderState } from './order-state.state';

export class CanceledOrderState implements IOrderState {
  public state = OrderState.CANCELED;

  public pending(): void {
    throw new Error('Order is already canceled');
  }
  public completed(): void {
    throw new Error('Order is already canceled');
  }
  public canceled(): void {
    throw new Error('Order is already canceled');
  }
}
