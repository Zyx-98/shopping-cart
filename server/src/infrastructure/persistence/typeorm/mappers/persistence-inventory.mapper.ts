import { Injectable } from '@nestjs/common';
import { InventorySchema } from '../entities/inventory.schema';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { InventoryId } from 'src/core/domain/inventory/value-object/inventory-id.vo';
import { DeepPartial } from 'typeorm';
import { Version } from 'src/core/domain/shared/domain/value-object/version.vo';

@Injectable()
export class PersistenceInventoryMapper {
  toDomain(schema: InventorySchema): InventoryAggregate {
    return InventoryAggregate.reconstitute({
      id: InventoryId.create(schema.uuid),
      productId: ProductId.create(schema.productId),
      quantity: Quantity.create(schema.stock),
      version: Version.create(schema.version || 1),
    });
  }

  toPersistence(aggregate: InventoryAggregate): DeepPartial<InventorySchema> {
    return {
      uuid: aggregate.id.toValue(),
      stock: aggregate.quantity.value,
      version: aggregate.version.value,
    };
  }
}
