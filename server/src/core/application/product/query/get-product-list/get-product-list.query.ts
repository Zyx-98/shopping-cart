import { Query } from '@nestjs/cqrs';
import {
  PaginatedResult,
  PaginationParams,
  QueryCriteria,
} from 'src/core/domain/shared/types/pagination.type';
import { ProductDto } from '../../dto/product.dto';

export class GetProductListQuery extends Query<PaginatedResult<ProductDto>> {
  constructor(
    public criteria: QueryCriteria,
    public pagination: PaginationParams,
  ) {
    super();
  }
}
