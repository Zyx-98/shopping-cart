import { UniqueEntityId } from '../value-object/unique-entity-id.vo';
import {
  PaginatedResult,
  QueryCriteria,
} from '../../types/query-criteria.interface';

export interface IReadableRepository<T> {
  findAll(criteria: QueryCriteria): Promise<PaginatedResult<T>>;
  findById(id: UniqueEntityId): Promise<T | null>;
  findByUniqueId<UId extends UniqueEntityId>(uniqueId: UId): Promise<T | null>;
}
