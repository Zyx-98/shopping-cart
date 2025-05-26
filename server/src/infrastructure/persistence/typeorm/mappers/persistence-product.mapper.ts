import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { ProductSchema } from '../entities/product.schema';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';

export class PersistenceProductMapper {
  toDomain(schema: ProductSchema): ProductAggregate {
    return ProductAggregate.reconstitute({
      id: ProductId.create(schema.uuid),
      name: schema.name,
      price: Price.create(schema.price),
    });
  }
}
