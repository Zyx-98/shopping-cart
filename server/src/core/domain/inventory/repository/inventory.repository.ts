import { ProductId } from '../../product/value-object/product-id.vo';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { InventoryAggregate } from '../aggregate/inventory.aggregate';

export interface IInventoryRepository
  extends IReadableRepository<InventoryAggregate>,
    IWritableRepository<InventoryAggregate> {
  findAllByProductId(productIds: ProductId[]): Promise<InventoryAggregate[]>;
  persistMany(entities: InventoryAggregate[]): Promise<void>;
}

export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository');
