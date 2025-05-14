export class PasswordTooShortException extends Error {
  constructor(length: number) {
    super(`Password must be at least ${length} characters long.`);
    this.name = 'PasswordTooShortException';
  }
}
