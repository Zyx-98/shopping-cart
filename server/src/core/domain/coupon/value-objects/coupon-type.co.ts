import { InvalidArgumentException } from '../../shared/domain/exceptions/invalid-argument.exception';

export class CouponType {
  private readonly value: string;

  private constructor(value: string) {
    const allowed = CouponType.allowedTypes();
    if (!allowed.includes(value)) {
      throw new InvalidArgumentException(
        `must be one of [${allowed.join(', ')}]`,
        'couponType',
      );
    }

    this.value = value;
    Object.freeze(this);
  }

  public static percentage(): CouponType {
    return new CouponType('percentage');
  }

  public static fixed(): CouponType {
    return new CouponType('fixed');
  }

  public static custom(value: string): CouponType {
    return new CouponType(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: CouponType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  private static allowedTypes(): string[] {
    return ['percentage', 'fixed'];
  }
}
