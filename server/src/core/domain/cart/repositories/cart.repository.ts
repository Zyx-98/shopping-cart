import { CustomerId } from '../../customer/value-objects/customer-id.vo';
import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { CartAggregate } from '../aggregate/cart.aggregate';

export interface ICartRepository extends IBaseRepository<CartAggregate> {
  findByCustomerId(customerId: CustomerId): Promise<CartAggregate | null>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');
