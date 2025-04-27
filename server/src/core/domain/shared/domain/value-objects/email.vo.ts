import { InvalidArgumentException } from '../exceptions/invalid-argument.exception';

export class EmailAddress {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: string): EmailAddress {
    this.validate(value);
    const normalizedEmail = value.trim().toLowerCase();
    return new EmailAddress(normalizedEmail);
  }

  private static validate(value: string): void {
    if (value === null || value === undefined || value.trim() === '') {
      throw new InvalidArgumentException(
        'Email address cannot be empty',
        'email',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new InvalidArgumentException(
        `"${value}" is not a valid email format`,
        'email',
      );
    }
  }

  public equals(other?: EmailAddress): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
