import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';

export class CompensateOrderInventoryCommand {
  constructor(
    public readonly products: {
      productId: ProductId;
      quantity: Quantity;
    }[],
  ) {}
}
