import { ProductId } from '../../product/value-object/product-id.vo';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { Version } from '../../shared/domain/value-object/version.vo';
import { InventoryAggregate } from '../aggregate/inventory.aggregate';
import { InventoryId } from '../value-object/inventory-id.vo';

export interface IInventoryRepository
  extends IReadableRepository<InventoryAggregate>,
    IWritableRepository<InventoryAggregate> {
  findAllByProductId(productIds: ProductId[]): Promise<InventoryAggregate[]>;
  persistMany(entities: InventoryAggregate[]): Promise<void>;
  persistManyWithVersion(
    entities: InventoryAggregate[],
    versionMap: Map<InventoryId, Version>,
  ): Promise<number>;
}

export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository');
