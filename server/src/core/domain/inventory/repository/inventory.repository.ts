import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { IWritableRepository } from '../../shared/domain/repository/writable.repository';
import { InventoryAggregate } from '../aggregate/inventory.aggregate';

export interface IInventoryRepository
  extends IReadableRepository<InventoryAggregate>,
    IWritableRepository<InventoryAggregate> {}

export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository');
