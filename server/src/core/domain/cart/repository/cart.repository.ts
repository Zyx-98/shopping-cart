import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { CartAggregate } from '../aggregate/cart.aggregate';

export interface ICartRepository
  extends IReadableRepository<CartAggregate>,
    IWritableRepository<CartAggregate> {}

export const CART_REPOSITORY = Symbol('ICartRepository');
