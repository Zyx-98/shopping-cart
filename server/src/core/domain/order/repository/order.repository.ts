import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { OrderAggregate } from '../aggregate/order.aggregate';

export interface IOrderRepository
  extends IReadableRepository<OrderAggregate>,
    IWritableRepository<OrderAggregate> {}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
