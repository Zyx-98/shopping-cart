import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repositories/cart.repository';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from 'src/core/domain/product/repositories/product.repository';
import { AddItemToCartCommand } from './add-item-to-cart.command';
import { CartAggregate } from 'src/core/domain/cart/aggregate/cart.aggregate';

@Injectable()
export class AddItemToCartHandler {
  constructor(
    @Inject(CART_REPOSITORY) private readonly cartRepository: ICartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: AddItemToCartCommand): Promise<void> {
    const { customerId, productId, quantity } = command;

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId.toString()} not found`,
      );
    }

    let cart = await this.cartRepository.findByCustomerId(customerId);

    if (!cart) {
      cart = CartAggregate.initializeCart(customerId);
    }

    cart.addCartItem(productId, quantity, product.itemPrice);

    await this.cartRepository.upsert(cart);
  }
}
