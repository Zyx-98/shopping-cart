import { IBaseRepository } from '../../shared/domain/repository/base-repository';
import { OrderAggregate } from '../aggregate/order.aggregate';

export interface IOrderRepository extends IBaseRepository<OrderAggregate> {}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
