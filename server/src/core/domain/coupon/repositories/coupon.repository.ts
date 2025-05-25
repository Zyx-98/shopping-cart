import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { CouponAggregate } from '../aggregate/coupon.aggregate';

export interface ICouponRepository
  extends IReadableRepository<CouponAggregate> {}

export const COUPON_REPOSITORY = Symbol('ICouponRepository');
