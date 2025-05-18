import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { SelectedProducts } from 'src/core/domain/order/aggregate/order.aggregate';

export class PlaceOrderCommand {
  constructor(
    public readonly customerId: CustomerId,
    public readonly selectedProducts: SelectedProducts,
  ) {}
}
