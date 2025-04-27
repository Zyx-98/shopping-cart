import { OrderState } from './order-state.state';

export class CompletedOrderState extends OrderState {
  protected value = 'completed';

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
