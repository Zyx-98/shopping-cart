import { Inject } from '@nestjs/common';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repository/product.repository';
import { PaginatedResult } from 'src/core/domain/shared/types/pagination.type';
import { ProductDto } from '../../dto/product.dto';
import { ProductMapper } from '../../mapper/product.mapper';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetProductListQuery } from './get-product-list.query';
import { GetInventoriesByProductIdsQuery } from 'src/core/application/inventory/query/get-inventories-by-product-ids/get-inventories-by-product-ids.query';

@QueryHandler(GetProductListQuery)
export class GetProductListHandler
  implements IQueryHandler<GetProductListQuery>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly mapper: ProductMapper,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: GetProductListQuery,
  ): Promise<PaginatedResult<ProductDto>> {
    const { criteria, pagination } = command;

    const paginatedResult = await this.productRepository.findWithPageLimit(
      criteria,
      pagination,
    );

    const inventories = await this.queryBus.execute(
      new GetInventoriesByProductIdsQuery(
        paginatedResult.data.map((aggregate) => aggregate.id),
      ),
    );

    const data = paginatedResult.data.map((aggregate) => {
      const inventory = inventories.find(({ productId }) =>
        productId.equals(aggregate.id),
      );

      return this.mapper.toDto(aggregate, inventory);
    });

    return {
      ...paginatedResult,
      data,
    };
  }
}
