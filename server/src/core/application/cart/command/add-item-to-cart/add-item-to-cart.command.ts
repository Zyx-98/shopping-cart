import { CustomerId } from 'src/core/domain/customer/value-objects/customer-id.vo';
import { ProductId } from 'src/core/domain/product/value-objects/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-objects/quantity.vo';

export class AddItemToCartCommand {
  constructor(
    public readonly customerId: CustomerId,
    public readonly productId: ProductId,
    public readonly quantity: Quantity,
  ) {}
}
