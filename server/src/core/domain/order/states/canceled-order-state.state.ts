import { OrderState } from './order-state.state';

export class CanceledOrderState extends OrderState {
  protected value = 'canceled';

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
