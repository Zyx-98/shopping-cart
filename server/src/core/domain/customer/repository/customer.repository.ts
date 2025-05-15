import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { CustomerAggregate } from '../aggregate/customer.aggregate';

export interface ICustomerRepository
  extends IReadableRepository<CustomerAggregate> {}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
