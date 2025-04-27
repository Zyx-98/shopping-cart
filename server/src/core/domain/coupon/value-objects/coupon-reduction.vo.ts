import { InvalidArgumentException } from '../../shared/domain/exceptions/invalid-argument.exception';
import { CouponType } from './coupon-type.co';

export class CouponReduction {
  private readonly type: CouponType;
  private readonly amount: number;

  private constructor(type: CouponType, amount: number) {
    if (amount <= 0) {
      throw new InvalidArgumentException(
        'reduction must be positive',
        'amount',
      );
    }

    if (type.equals(CouponType.percentage()) && amount > 100) {
      throw new InvalidArgumentException(
        'percentage cannot exceed 100%',
        'amount',
      );
    }

    this.type = type;
    this.amount = amount;
  }

  public static fixed(amount: number): CouponReduction {
    return new CouponReduction(CouponType.fixed(), amount);
  }

  public static percentage(amount: number): CouponReduction {
    return new CouponReduction(CouponType.percentage(), amount);
  }

  public static of(type: CouponType, amount: number): CouponReduction {
    return new CouponReduction(type, amount);
  }

  public applyTo(base: number): number {
    if (base < 0) {
      throw new InvalidArgumentException(
        'base amount must be non-negative',
        'base',
      );
    }

    if (this.type.equals(CouponType.fixed())) {
      return Math.max(0, base - this.amount);
    }

    if (this.type.equals(CouponType.percentage())) {
      const reduction = (this.amount / 100) * base;
      return Math.max(0, base - reduction);
    }

    throw new InvalidArgumentException(
      `Cannot apply reduction for type [${this.type.toString()}]`,
      'couponType',
    );
  }

  public getType(): CouponType {
    return this.type;
  }

  public getAmount(): number {
    return this.amount;
  }

  public toString(): string {
    return this.type.equals(CouponType.percentage())
      ? `-${this.amount}%`
      : `-${this.amount}`;
  }
}
