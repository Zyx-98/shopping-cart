import { IBaseRepository } from '../../shared/domain/repository/base-repository';
import { InventoryAggregate } from '../aggregate/inventory.aggregate';

export interface IInventoryRepository
  extends IBaseRepository<InventoryAggregate> {}

export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository');
