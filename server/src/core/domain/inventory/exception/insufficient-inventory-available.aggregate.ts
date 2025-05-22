export class InsufficientInventoryAvailableException extends Error {
  constructor(
    public readonly productId: string,
    public readonly availableQuantity: number,
    public readonly requestedQuantity: number,
  ) {
    super(
      `Insufficient inventory for product ${productId}. Available: ${availableQuantity}, Requested: ${requestedQuantity}`,
    );
  }
}
