import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductListHandler } from 'src/core/application/product/query/get-product-list.handler';
import { GetProductListQuery } from 'src/core/application/product/query/get-product-list.query';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductDto } from 'src/core/application/product/dto/product.dto';
import { PaginatedResultDto } from '../../shared/dto/paginated-result.dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly getProductListHandler: GetProductListHandler) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of product' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the product list',
    type: PaginatedResultDto<ProductDto>,
  })
  async getProducts(
    @Query() queryCriteria: ProductQueryDto,
  ): Promise<PaginatedResultDto<ProductDto>> {
    const query = new GetProductListQuery({
      filter: queryCriteria.filter,
      sort: queryCriteria.sort,
      pagination: {
        page: queryCriteria.page,
        limit: queryCriteria.limit,
      },
    });

    const result = await this.getProductListHandler.execute(query);

    return result;
  }
}
