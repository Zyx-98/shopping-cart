import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { IProductRepository } from 'src/core/domain/product/repository/product.repository';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { ProductSchema } from '../entities/product.schema';
import { Repository } from 'typeorm';
import { PersistenceProductMapper } from '../mappers/persistence-product.mapper';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductSchema)
    private readonly ormRepository: Repository<ProductSchema>,
    private readonly mapper: PersistenceProductMapper,
  ) {}
  async findAll(): Promise<ProductAggregate[]> {
    const schemas = await this.ormRepository.find();

    return schemas.map((schema) => this.mapper.toDomain(schema));
  }
  async findById(id: ProductId): Promise<ProductAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: id.toString(),
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
  store(_entity: ProductAggregate): Promise<ProductAggregate> {
    throw new Error('Method not implemented.');
  }
  update(_entity: ProductAggregate): Promise<ProductAggregate> {
    throw new Error('Method not implemented.');
  }
  upsert(_entity: ProductAggregate): Promise<ProductAggregate> {
    throw new Error('Method not implemented.');
  }
}
