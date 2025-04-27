import { AggregateRoot } from '@nestjs/cqrs';
import { CouponId } from '../value-objects/coupon-id.vo';
import { CouponCode } from '../value-objects/coupon-code.vo';
import { CouponType } from '../value-objects/coupon-type.co';
import { CouponReduction } from '../value-objects/coupon-reduction.vo';

export class CouponAggregate extends AggregateRoot {
  private _couponId: CouponId;
  private _couponCode: CouponCode;
  private _couponType: CouponType;
  private _reduction: CouponReduction;

  public constructor(
    couponId: CouponId,
    couponCode: CouponCode,
    couponType: CouponType,
    reduction: CouponReduction,
  ) {
    super();
    this._couponId = couponId;
    this._couponCode = couponCode;
    this._couponType = couponType;
    this._reduction = reduction;
  }

  get couponId(): CouponId {
    return this._couponId;
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
