import { Inject, Injectable } from '@nestjs/common';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repository/product.repository';
import { GetProductListQuery } from './get-product-list.query';
import { PaginatedResult } from 'src/core/domain/shared/types/pagination.type';
import { ProductDto } from '../dto/product.dto';
import { ProductMapper } from '../mapper/product.mapper';

@Injectable()
export class GetProductListHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly mapper: ProductMapper,
  ) {}

  async execute(
    command: GetProductListQuery,
  ): Promise<PaginatedResult<ProductDto>> {
    const { criteria, pagination } = command;

    const paginatedResult = await this.productRepository.findWithPageLimit(
      criteria,
      pagination,
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((aggregate) =>
        this.mapper.toDto(aggregate),
      ),
    };
  }
}
