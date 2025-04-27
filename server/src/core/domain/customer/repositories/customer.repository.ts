import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { CustomerAggregate } from '../aggregate/customer.aggregate';

export interface ICustomerRepository
  extends IBaseRepository<CustomerAggregate> {}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
