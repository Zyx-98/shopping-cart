export class PasswordOperationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordOperationException';
  }
}
