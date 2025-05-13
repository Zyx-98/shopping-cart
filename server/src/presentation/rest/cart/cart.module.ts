import { Module } from '@nestjs/common';
import { CartController } from './controller/cart.controller';
import { GetCartByCustomerIdHandler } from 'src/core/application/cart/query/get-cart-by-customer-id/get-cart-by-customer-id.handler';
import { CartMapper } from 'src/core/application/cart/mapper/cart.mapper';
import { AddItemToCartHandler } from 'src/core/application/cart/command/add-item-to-cart/add-item-to-cart.handler';
import { RemoveItemFromCartHandler } from 'src/core/application/cart/command/remove-item-from-cart/remove-item-from-cart.handler';
import { UpdateItemQuantityHandler } from 'src/core/application/cart/command/update-item-quantity/update-item-quantity.handler';

@Module({
  controllers: [CartController],
  providers: [
    GetCartByCustomerIdHandler,
    CartMapper,
    AddItemToCartHandler,
    RemoveItemFromCartHandler,
    UpdateItemQuantityHandler,
  ],
})
export class CartModule {}
