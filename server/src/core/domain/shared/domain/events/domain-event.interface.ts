import { UniqueEntityId } from '../value-objects/unique-entity-id.vo';

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityId;
}
