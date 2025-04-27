import { IBaseRepository } from '../../shared/domain/repositories/base-repository';
import { CartItem } from '../entities/cart-item.entity';

export interface ICartItemRepository extends IBaseRepository<CartItem> {}

export const CART_ITEM_REPOSITORY = Symbol('ICartItemRepository');
