import { Query } from '@nestjs/cqrs';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { CartDto } from '../../dto/cart.dto';

export class GetCartByCustomerIdQuery extends Query<CartDto | null> {
  constructor(public readonly customerId: CustomerId) {
    super();
  }
}
