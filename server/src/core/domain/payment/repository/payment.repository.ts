import { OrderId } from '../../order/value-object/order-id.vo';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { PaymentAggregate } from '../aggregate/payment.aggregate';

export interface IPaymentRepository
  extends IReadableRepository<PaymentAggregate>,
    IWritableRepository<PaymentAggregate> {
  findByOrderId(orderId: OrderId): Promise<PaymentAggregate | null>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
