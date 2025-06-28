import { Query } from '@nestjs/cqrs';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';

export class GetInventoriesByProductIdsQuery extends Query<
  InventoryAggregate[]
> {
  constructor(public readonly productIds: ProductId[]) {
    super();
  }
}
