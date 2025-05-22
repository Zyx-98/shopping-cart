import { IPageLimitPaginationRepository } from '../../shared/domain/repository/page-limit-pagination.repository';
import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { ProductAggregate } from '../aggregate/product.aggregate';
import { ProductId } from '../value-object/product-id.vo';

export interface IProductRepository
  extends IPageLimitPaginationRepository<ProductAggregate>,
    IReadableRepository<ProductAggregate> {
  findAllByIds(ProductIds: ProductId[]): Promise<ProductAggregate[]>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
