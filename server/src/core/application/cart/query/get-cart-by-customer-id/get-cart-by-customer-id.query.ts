import { Query } from '@nestjs/cqrs';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { CartDtoWithCursorPagination } from '../../dto/cart.dto';
import { CursorPaginationParams } from 'src/core/domain/shared/types/pagination.type';

export class GetCartByCustomerIdQuery extends Query<CartDtoWithCursorPagination | null> {
  constructor(
    public readonly customerId: CustomerId,
    public readonly cursor: CursorPaginationParams,
  ) {
    super();
  }
}
