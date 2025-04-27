import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { PaymentAggregate } from '../aggregate/payment.aggregate';

export interface IPaymentRepository extends IBaseRepository<PaymentAggregate> {}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
