import { CustomerId } from '../../customer/value-object/customer-id.vo';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import {
  CursorPaginatedResult,
  CursorPaginationParams,
} from '../../shared/types/pagination.type';
import { CartAggregate } from '../aggregate/cart.aggregate';
import { CartItem } from '../entity/cart-item.entity';

export interface ICartRepository
  extends IReadableRepository<CartAggregate>,
    IWritableRepository<CartAggregate> {
  findByCustomerIdWithCursorPaginatedCartItems(
    customerId: CustomerId,
    cursor: CursorPaginationParams,
  ): Promise<{
    cart: CartAggregate;
    pagination: Omit<CursorPaginatedResult<CartItem>, 'data'>;
  } | null>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');
