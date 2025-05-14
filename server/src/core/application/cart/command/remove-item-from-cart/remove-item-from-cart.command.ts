import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';

export class RemoveItemFromCartCommand {
  constructor(
    public readonly customerId: CustomerId,
    public readonly productId: ProductId,
  ) {}
}
