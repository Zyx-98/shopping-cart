import { CustomerId } from '../../customer/value-objects/customer-id.vo';
import { IDomainEvent } from '../../shared/domain/events/domain-event.interface';
import { CartId } from '../value-objects/cart-id.vo';

export class CartInitializedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly cartId: CartId;
  public readonly customerId: CustomerId;

  constructor(cartId: CartId, customerId: CustomerId) {
    this.dateTimeOccurred = new Date();
    this.cartId = cartId;
    this.customerId = customerId;
  }

  getAggregateId(): CartId {
    return this.cartId;
  }
}
