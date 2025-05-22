import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';
import { IInventoryRepository } from 'src/core/domain/inventory/repository/inventory.repository';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';
import { QueryCriteria } from 'src/core/domain/shared/types/pagination.type';
import { InventorySchema } from '../entities/inventory.schema';
import { In, Repository } from 'typeorm';
import { PersistenceInventoryMapper } from '../mappers/persistence-inventory.mapper';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(InventorySchema)
    private readonly ormRepository: Repository<InventorySchema>,
    private readonly mapper: PersistenceInventoryMapper,
  ) {}
  async findAllByProductId(
    productIds: ProductId[],
  ): Promise<InventoryAggregate[]> {
    const schemas = await this.ormRepository.find({
      where: {
        productId: In(productIds.map((productId) => productId.toValue())),
      },
    });

    return schemas.map((schema) => this.mapper.toDomain(schema));
  }
  async persistMany(entities: InventoryAggregate[]): Promise<void> {
    const schemas = entities.map((entity) => this.mapper.toPersistence(entity));

    const existingSchemas = await this.ormRepository.find({
      where: {
        uuid: In(schemas.map((schema) => schema.uuid)),
      },
    });

    await this.ormRepository.save(
      existingSchemas.map((existingSchema) => ({
        ...existingSchema,
        ...schemas.find((schema) => schema.uuid === existingSchema.uuid),
      })),
    );
  }
  findAll(_criteria: QueryCriteria): Promise<InventoryAggregate[]> {
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

    const inventory = await this.ormRepository.save(persistence);

    return this.mapper.toDomain(inventory);
  }
}
