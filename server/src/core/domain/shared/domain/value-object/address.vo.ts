import { InvalidArgumentException } from '../exception/invalid-argument.exception';

export class Address {
  public readonly street: string;
  public readonly city: string;
  public readonly postalCode: string;
  public readonly country: string;
  public readonly stateOrProvince?: string;

  private constructor(props: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    stateOrProvince?: string;
  }) {
    this.street = props.street;
    this.city = props.city;
    this.postalCode = props.postalCode;
    this.country = props.country;
    this.stateOrProvince = props.stateOrProvince;
    Object.freeze(this);
  }

  public static create(props: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    stateOrProvince?: string;
  }): Address {
    this.validate(props);

    const trimmedProps = {
      street: props.street.trim(),
      city: props.city.trim(),
      postalCode: props.postalCode.trim(),
      country: props.country.trim(),
      stateOrProvince: props.stateOrProvince?.trim(),
    };
    return new Address(trimmedProps);
  }

  private static validate(props: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    stateOrProvince?: string;
  }): void {
    if (!props.street?.trim()) {
      throw new InvalidArgumentException(
        'Street cannot be empty',
        'address.street',
      );
    }
    if (!props.city?.trim()) {
      throw new InvalidArgumentException(
        'City cannot be empty',
        'address.city',
      );
    }
    if (!props.postalCode?.trim()) {
      throw new InvalidArgumentException(
        'Postal code cannot be empty',
        'address.postalCode',
      );
    }
    if (!props.country?.trim()) {
      throw new InvalidArgumentException(
        'Country cannot be empty',
        'address.country',
      );
    }
  }

  public equals(other?: Address): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.postalCode === other.postalCode &&
      this.country === other.country &&
      this.stateOrProvince === other.stateOrProvince
    );
  }

  public toString(): string {
    let addressString = `${this.street}, ${this.city}, ${this.postalCode}`;
    if (this.stateOrProvince) {
      addressString += `, ${this.stateOrProvince}`;
    }
    addressString += `, ${this.country}`;
    return addressString;
  }

  public toJSON() {
    return {
      street: this.street,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      stateOrProvince: this.stateOrProvince,
    };
  }
}
