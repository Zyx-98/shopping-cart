import { UniqueEntityId } from '../value-object/unique-entity-id.vo';

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityId;
}
