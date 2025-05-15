import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { CouponAggregate } from '../aggregate/coupon.aggregate';

export interface CouponRepository
  extends IReadableRepository<CouponAggregate> {}

export const COUPON_REPOSITORY = Symbol('ICouponRepository');
