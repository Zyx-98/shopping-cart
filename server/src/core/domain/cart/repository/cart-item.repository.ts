import { IBaseRepository } from '../../shared/domain/repository/base-repository';
import { CartItem } from '../entity/cart-item.entity';

export interface ICartItemRepository extends IBaseRepository<CartItem> {}

export const CART_ITEM_REPOSITORY = Symbol('ICartItemRepository');
