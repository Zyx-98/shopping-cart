import { CustomerId } from 'src/core/domain/customer/value-objects/customer-id.vo';
import { ProductId } from 'src/core/domain/product/value-objects/product-id.vo';

export class RemoveItemFromCartCommand {
  constructor(
    public readonly customerId: CustomerId,
    public readonly productId: ProductId,
  ) {}
}
