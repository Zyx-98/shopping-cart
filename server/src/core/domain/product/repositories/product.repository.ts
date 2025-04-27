import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { ProductAggregate } from '../aggregate/product.aggregate';

export interface IProductRepository extends IBaseRepository<ProductAggregate> {}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
