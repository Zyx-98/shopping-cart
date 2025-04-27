import { Sort } from '../../types/sort';
import { UniqueEntityId } from '../value-objects/unique-entity-id.vo';

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: UniqueEntityId): Promise<T | null>;
  store(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  remove(entity: T): Promise<void>;
  removeById(id: UniqueEntityId): Promise<void>;
  findByCriteriaAndPaginate(
    criteria: any,
    page: number,
    limit: number,
  ): Promise<{ items: T[]; total: number }>;
  findByCriteria(criteria: any): Promise<T[]>;
  findByCriteriaAndSort(criteria: any, sorts: Sort): Promise<T[]>;
  findByCriteriaAndPaginateAndSort(
    criteria: any,
    page: number,
    limit: number,
    sorts: Sort[],
  ): Promise<{ items: T[]; total: number }>;
  findOneByCriteria(criteria: any): Promise<T | null>;
}
