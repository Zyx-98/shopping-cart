import { UserId } from '../../user/value-objects/user-id.vo';
import { CustomerAggregate } from '../aggregate/customer.aggregate';

export interface ICustomerRepository {
  findByUserId(userId: UserId): Promise<CustomerAggregate | null>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
