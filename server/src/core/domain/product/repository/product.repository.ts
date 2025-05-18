import { IPageLimitPaginationRepository } from '../../shared/domain/repository/page-limit-pagination.repository';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { ProductAggregate } from '../aggregate/product.aggregate';

export interface IProductRepository
  extends IPageLimitPaginationRepository<ProductAggregate>,
    IReadableRepository<ProductAggregate> {}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
