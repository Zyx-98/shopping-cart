import { OrderAggregate } from '../aggregate/order.aggregate';

export abstract class OrderState {
  protected abstract value: string;

  public getStateValue(): string {
    return this.value;
  }

  abstract pending(order: OrderAggregate): void;
  abstract completed(order: OrderAggregate): void;
  abstract canceled(order: OrderAggregate): void;
}
