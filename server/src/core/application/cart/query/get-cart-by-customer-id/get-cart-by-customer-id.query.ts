import { CustomerId } from 'src/core/domain/customer/value-objects/customer-id.vo';

export class getCartByCustomerIdQuery {
  constructor(public readonly customerId: CustomerId) {}
}
