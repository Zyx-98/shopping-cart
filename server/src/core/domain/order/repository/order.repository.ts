import { CustomerId } from '../../customer/value-object/customer-id.vo';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { OrderAggregate } from '../aggregate/order.aggregate';
import { OrderId } from '../value-object/order-id.vo';

export interface IOrderRepository
  extends IReadableRepository<OrderAggregate>,
    IWritableRepository<OrderAggregate> {
  findBelongToCustomerById(
    orderId: OrderId,
    customerId: CustomerId,
  ): Promise<OrderAggregate | null>;
}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
