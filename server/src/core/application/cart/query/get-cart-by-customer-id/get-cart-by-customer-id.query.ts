import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';

export class getCartByCustomerIdQuery {
  constructor(public readonly customerId: CustomerId) {}
}
