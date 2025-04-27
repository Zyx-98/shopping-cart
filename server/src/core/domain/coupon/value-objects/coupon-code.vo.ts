import { InvalidArgumentException } from '../../shared/domain/exceptions/invalid-argument.exception';

export class CouponCode {
  public readonly value: string;

  private static readonly EXACT_LENGTH = 8;
  private static readonly ALLOWED_CHARS_REGEX = /^[A-Z0-9]+$/; // Uppercase Alphanumeric

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: string): CouponCode {
    this.validate(value);

    const normalizedValue = value.trim().toUpperCase();
    return new CouponCode(normalizedValue);
  }

  private static validate(value: string): void {
    if (value === null || value === undefined || value.trim() === '') {
      throw new InvalidArgumentException(
        'Coupon code cannot be empty',
        'couponCode',
      );
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length !== this.EXACT_LENGTH) {
      throw new InvalidArgumentException(
        `Coupon code must be exactly ${this.EXACT_LENGTH} characters long`,
        'couponCode',
      );
    }

    if (!this.ALLOWED_CHARS_REGEX.test(trimmedValue.toUpperCase())) {
      throw new InvalidArgumentException(
        'Coupon code must contain only uppercase letters (A-Z) and numbers (0-9)',
        'couponCode',
      );
    }
  }

  public equals(other?: CouponCode): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
