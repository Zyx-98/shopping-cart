import { UniqueEntityId } from '../value-object/unique-entity-id.vo';

export interface IReadableRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: UniqueEntityId): Promise<T | null>;
  findByUniqueId<UId extends UniqueEntityId>(uniqueId: UId): Promise<T | null>;
}
