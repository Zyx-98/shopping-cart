import { AggregateRoot } from '@nestjs/cqrs';
import { UniqueEntityId } from '../value-object/unique-entity-id.vo';

export abstract class BaseAggregateRoot<
  TId extends UniqueEntityId,
> extends AggregateRoot {
  protected readonly _id: TId;

  protected constructor(id: TId) {
    super();
    this._id = id;
  }

  get id(): TId {
    return this._id;
  }
}
