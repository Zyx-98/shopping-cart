import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { CartAggregate } from '../aggregate/cart.aggregate';

export interface ICartRepository extends IBaseRepository<CartAggregate> {}

export const CART_REPOSITORY = Symbol('ICartRepository');
