import { Inject, Injectable } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repositories/cart.repository';
import { CartMapper } from '../../mapper/cart.mapper';
import { getCartByCustomerIdQuery } from './get-cart-by-customer-id.query';
import { CartDto } from '../../dto/cart.dto';

@Injectable()
export class GetCartByCustomerIdHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartMapper: CartMapper,
  ) {}

  async execute(query: getCartByCustomerIdQuery): Promise<CartDto | null> {
    const { customerId } = query;

    const cart = await this.cartRepository.findByCustomerId(customerId);

    if (!cart) return null;

    return this.cartMapper.toDto(cart);
  }
}
