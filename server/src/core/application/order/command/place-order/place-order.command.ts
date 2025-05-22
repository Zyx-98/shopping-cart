import { Command } from '@nestjs/cqrs';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { SelectedProducts } from 'src/core/domain/order/aggregate/order.aggregate';

export class PlaceOrderCommand extends Command<{ uuid: string }> {
  constructor(
    public readonly customerId: CustomerId,
    public readonly selectedProducts: SelectedProducts,
  ) {
    super();
  }
}
