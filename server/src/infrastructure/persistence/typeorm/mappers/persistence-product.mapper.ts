import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { ProductSchema } from '../entities/product.schema';
import { ProductId } from 'src/core/domain/product/value-objects/product-id.vo';
import { Price } from 'src/core/domain/shared/domain/value-objects/price.vo';

export class PersistenceProductMapper {
  toDomain(schema: ProductSchema): ProductAggregate {
    return ProductAggregate.reconstitute({
      id: ProductId.create(schema.uuid),
      name: schema.name,
      price: Price.create(schema.itemPrice),
    });
  }
}
