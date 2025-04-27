import { InvalidArgumentException } from '../exceptions/invalid-argument.exception';

export class Quantity {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: number): Quantity {
    this.validate(value);
    return new Quantity(value);
  }

  private static validate(value: number): void {
    if (value === null || value === undefined) {
      throw new InvalidArgumentException(
        'Quantity cannot be null or undefined',
        'quantity',
      );
    }

    if (isNaN(value)) {
      throw new InvalidArgumentException(
        'Quantity must be a valid number',
        'quantity',
      );
    }

    if (!Number.isInteger(value)) {
      throw new InvalidArgumentException(
        'Quantity must be an integer',
        'quantity',
      );
    }

    if (value < 0) {
      throw new InvalidArgumentException(
        'Quantity cannot be negative',
        'quantity',
      );
    }
  }

  public equals(other?: Quantity): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  public add(other: Quantity): Quantity {
    return Quantity.create(this.value + other.value);
  }

  public subtract(other: Quantity): Quantity {
    return Quantity.create(this.value - other.value);
  }

  public isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  public isLessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public toNumber(): number {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
