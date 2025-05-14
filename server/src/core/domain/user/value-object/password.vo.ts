import { PasswordOperationException } from '../exception/password-operation.exception';
import { PasswordTooShortException } from '../exception/password-too-short.exception';
import * as bcrypt from 'bcrypt';

export class Password {
  private readonly _hashedValue: string;
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;

  private constructor(hashedValue: string) {
    this._hashedValue = hashedValue;
  }

  public get value(): string {
    return this._hashedValue;
  }

  public static async create(candidate: string): Promise<Password> {
    this.validate(candidate);
    const hashedValue = await bcrypt.hash(candidate, this.SALT_ROUNDS);
    return new Password(hashedValue);
  }

  public static createFromHash(hash: string): Password {
    if (!hash) {
      throw new PasswordOperationException(
        'Stored password hash cannot be empty',
      );
    }

    return new Password(hash);
  }

  private static validate(candidate: string): void {
    if (!candidate) {
      throw new PasswordOperationException('Passord should not be emmpty');
    }

    if (candidate.length < this.MIN_LENGTH) {
      throw new PasswordTooShortException(this.MIN_LENGTH);
    }

    // Add more complex rules as needed (e.g., regex for uppercase, lowercase, number, symbol)
    // Example: Must contain at least one uppercase letter, one lowercase letter, and one number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!regex.test(candidate)) {
      throw new PasswordOperationException(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      );
    }
  }

  public async compare(candidate: string): Promise<boolean> {
    if (!candidate) {
      return false;
    }
    return bcrypt.compare(candidate, this._hashedValue);
  }
  public equals(other?: Password): boolean {
    if (other === undefined || other === null) {
      return false;
    }
    return this._hashedValue === other._hashedValue;
  }
}
