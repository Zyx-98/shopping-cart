export class OrderException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderException';
  }
}
