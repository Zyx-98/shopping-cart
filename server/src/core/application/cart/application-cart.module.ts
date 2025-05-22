import { Module } from '@nestjs/common';
import { GetCartByCustomerIdHandler } from './query/get-cart-by-customer-id/get-cart-by-customer-id.handler';
import { AddItemToCartHandler } from './command/add-item-to-cart/add-item-to-cart.handler';
import { RemoveItemFromCartHandler } from './command/remove-item-from-cart/remove-item-from-cart.handler';
import { UpdateItemQuantityHandler } from './command/update-item-quantity/update-item-quantity.handler';
import { CartMapper } from './mapper/cart.mapper';

@Module({
  providers: [
    GetCartByCustomerIdHandler,
    AddItemToCartHandler,
    RemoveItemFromCartHandler,
    UpdateItemQuantityHandler,
    CartMapper,
  ],
  exports: [
    GetCartByCustomerIdHandler,
    AddItemToCartHandler,
    RemoveItemFromCartHandler,
    UpdateItemQuantityHandler,
    CartMapper,
  ],
})
export class ApplicationCartModule {}
