import { InvalidArgumentException } from '../exception/invalid-argument.exception';

export class PhoneNumber {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: string): PhoneNumber {
    this.validate(value);

    const normalizedPhone = value.replace(/[\s\-()]/g, '');
    return new PhoneNumber(normalizedPhone);
  }

  private static validate(value: string): void {
    if (value === null || value === undefined || value.trim() === '') {
      throw new InvalidArgumentException(
        'Phone number cannot be empty',
        'phone',
      );
    }

    // Example: Basic validation for digits, possibly hyphens/spaces/parentheses
    // You might use a library like 'libphonenumber-js' for robust validation/formatting
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!phoneRegex.test(value)) {
      throw new InvalidArgumentException(
        `"${value}" is not a valid phone number format`,
        'phone',
      );
    }
  }

  public equals(other?: PhoneNumber): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  //   // Optional: Example method specific to the value object
  //   public getFormattedValue(format: 'E.164' | 'national' = 'national'): string {
  //     // Here you would ideally use a library like libphonenumber-js
  //     // For this example, we'll just return the normalized value
  //     // A real implementation would format based on country code, etc.
  //     return this.value;
  //   }
}
