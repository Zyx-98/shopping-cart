import { OrderState } from '../enum/order-state.enum';
import { OrderException } from './order.exception';

export class OrderStateTransitionException extends OrderException {
  constructor(fromState: OrderState, toState: OrderState, message?: string) {
    super(
      message || `Cannot transition order from ${fromState} to ${toState}.`,
    );
    this.name = 'OrderStateTransitionException';
  }
}
