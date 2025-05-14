import { IBaseRepository } from '../../shared/domain/repository/base-repository';
import { CouponAggregate } from '../aggregate/coupon.aggregate';

export interface CouponRepository extends IBaseRepository<CouponAggregate> {}

export const COUPON_REPOSITORY = Symbol('ICouponRepository');
