export class Version {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  public static create(value: number): Version {
    if (value < 0) {
      throw new Error('Version number cannot be negative.');
    }
    return new Version(value);
  }

  public static initial(): Version {
    return new Version(1);
  }

  public next(): Version {
    return new Version(this._value + 1);
  }

  public equals(other?: Version | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._value === other.value;
  }

  public isGreaterThan(other: Version): boolean {
    return this._value > other.value;
  }

  public isLessThan(other: Version): boolean {
    return this._value < other.value;
  }

  public toString(): string {
    return String(this._value);
  }
}
