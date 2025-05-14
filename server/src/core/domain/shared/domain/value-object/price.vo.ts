import { InvalidArgumentException } from '../exception/invalid-argument.exception';

export class Price {
  public readonly amount: number;
  public readonly currency: string; // e.g., 'USD', 'VND', 'EUR' (ISO 4217 code)

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
    Object.freeze(this);
  }

  public static create(amount: number, currency: string = 'USD'): Price {
    this.validate(amount, currency);
    const normalizedCurrency = currency.trim().toUpperCase();
    return new Price(amount, normalizedCurrency);
  }

  private static validate(amount: number, currency: string): void {
    if (amount === null || amount === undefined) {
      throw new InvalidArgumentException(
        'Price amount cannot be null or undefined',
        'price.amount',
      );
    }
    if (amount < 0) {
      throw new InvalidArgumentException(
        'Price amount cannot be negative',
        'price.amount',
      );
    }
    if (isNaN(amount)) {
      throw new InvalidArgumentException(
        'Price amount must be a valid number',
        'price.amount',
      );
    }

    if (currency === null || currency === undefined || currency.trim() === '') {
      throw new InvalidArgumentException(
        'Currency cannot be empty',
        'price.currency',
      );
    }
    // Basic validation for currency code (e.g., 3 letters)
    // For robust validation, check against a list of valid ISO 4217 codes
    if (!/^[A-Z]{3}$/i.test(currency.trim())) {
      throw new InvalidArgumentException(
        `"${currency}" is not a valid ISO 4217 currency code format`,
        'price.currency',
      );
    }
  }

  public equals(other?: Price): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    return this.amount === other.amount && this.currency === other.currency;
  }

  public add(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new InvalidArgumentException(
        'Cannot add Prices with different currencies',
      );
    }
    return Price.create(this.amount + other.amount, this.currency);
  }

  public subtract(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new InvalidArgumentException(
        'Cannot subtract Prices with different currencies',
      );
    }
    // Validation for negative result happens in create()
    return Price.create(this.amount - other.amount, this.currency);
  }

  public multiply(factor: number): Price {
    if (isNaN(factor)) {
      throw new InvalidArgumentException(
        'Multiplication factor must be a number',
      );
    }
    return Price.create(this.amount * factor, this.currency);
  }

  public toString(): string {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: this.currency,
      }).format(this.amount);
    } catch {
      return `${this.currency} ${this.amount.toFixed(2)}`;
    }
  }

  public toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
