export class CartOperationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CartOperationException';
  }
}
