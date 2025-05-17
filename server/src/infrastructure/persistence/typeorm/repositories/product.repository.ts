import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { IProductRepository } from 'src/core/domain/product/repository/product.repository';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { ProductSchema } from '../entities/product.schema';
import { Repository } from 'typeorm';
import { PersistenceProductMapper } from '../mappers/persistence-product.mapper';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';
import {
  PaginatedResult,
  QueryCriteria,
} from 'src/core/domain/shared/types/query-criteria.interface';
import { TypeOrmQueryBuilderService } from '../query-builder/typeorm-query-builder.service';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductSchema)
    private readonly ormRepository: Repository<ProductSchema>,
    private readonly mapper: PersistenceProductMapper,
    private readonly queryBuilderService: TypeOrmQueryBuilderService,
  ) {}
  findByUniqueId<P extends UniqueEntityId>(
    _uniqueId: P,
  ): Promise<ProductAggregate | null> {
    throw new Error('Method not implemented.');
  }
  async findAll(
    criteria: QueryCriteria,
  ): Promise<PaginatedResult<ProductAggregate>> {
    const paginatedEntitiesResult =
      await this.queryBuilderService.buildQuery<ProductSchema>(
        this.ormRepository,
        criteria,
        {
          alias: 'product',
          allowedFilters: ['uuid', 'name'],
          allowedSorts: ['name', 'uuid', 'createdAt'],
          defaultSort: [{ field: 'createdAt', direction: 'DESC' }],
        },
      );

    return {
      ...paginatedEntitiesResult,
      data: paginatedEntitiesResult.data.map((schema) =>
        this.mapper.toDomain(schema),
      ),
    };
  }
  async findById(id: ProductId): Promise<ProductAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: id.toString(),
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
}
