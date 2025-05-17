import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';
import { IInventoryRepository } from 'src/core/domain/inventory/repository/inventory.repository';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';
import {
  QueryCriteria,
  PaginatedResult,
} from 'src/core/domain/shared/types/pagination.type';
import { InventorySchema } from '../entities/inventory.schema';
import { Repository } from 'typeorm';
import { PersistenceInventoryMapper } from '../mappers/persistence-inventory.mapper';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(InventorySchema)
    private readonly ormRepository: Repository<InventorySchema>,
    private readonly mapper: PersistenceInventoryMapper,
  ) {}
  findAll(
    _criteria: QueryCriteria,
  ): Promise<PaginatedResult<InventoryAggregate>> {
    throw new Error('Method not implemented.');
  }
  async findById(id: UniqueEntityId): Promise<InventoryAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: id.toValue(),
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
  async findByUniqueId<UId extends UniqueEntityId>(
    uniqueId: UId,
  ): Promise<InventoryAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: uniqueId.toValue(),
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
  async persist(entity: InventoryAggregate): Promise<InventoryAggregate> {
    const persistence = this.mapper.toPersistence(entity);

    let inventory = await this.ormRepository.findOne({
      where: {
        uuid: persistence.uuid,
      },
    });

    if (!inventory) {
      inventory = this.ormRepository.create(persistence);
    } else {
      inventory = await this.ormRepository.save(persistence);
    }

    return this.mapper.toDomain(inventory);
  }
}
