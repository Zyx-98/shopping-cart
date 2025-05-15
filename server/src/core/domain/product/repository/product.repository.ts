import { IReadableRepository } from '../../shared/domain/repository/readable.repository';
import { ProductAggregate } from '../aggregate/product.aggregate';

export interface IProductRepository
  extends IReadableRepository<ProductAggregate> {}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
