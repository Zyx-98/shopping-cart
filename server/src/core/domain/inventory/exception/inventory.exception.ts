export class InventoryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryException';
  }
}
