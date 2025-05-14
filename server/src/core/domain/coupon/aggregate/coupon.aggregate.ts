import { CouponId } from '../value-objects/coupon-id.vo';
import { CouponCode } from '../value-objects/coupon-code.vo';
import { CouponType } from '../value-objects/coupon-type.co';
import { CouponReduction } from '../value-objects/coupon-reduction.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

export interface CouponProps {
  id: CouponId;
  couponCode: CouponCode;
  couponType: CouponType;
  reduction: CouponReduction;
}

export class CouponAggregate extends BaseAggregateRoot<CouponId> {
  private _couponCode: CouponCode;
  private _couponType: CouponType;
  private _reduction: CouponReduction;

  public constructor(props: CouponProps) {
    super(props.id);
    this._couponCode = props.couponCode;
    this._couponType = props.couponType;
    this._reduction = props.reduction;
  }

  get couponCode(): CouponCode {
    return this._couponCode;
  }

  get couponType(): CouponType {
    return this._couponType;
  }

  get reduction(): CouponReduction {
    return this._reduction;
  }
}
