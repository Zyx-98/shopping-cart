import { Inject } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repository/cart.repository';
import { CartMapper } from '../../mapper/cart.mapper';
import { GetCartByCustomerIdQuery } from './get-cart-by-customer-id.query';
import { CartDto } from '../../dto/cart.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetCartByCustomerIdQuery)
export class GetCartByCustomerIdHandler
  implements IQueryHandler<GetCartByCustomerIdQuery, CartDto | null>
{
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartMapper: CartMapper,
  ) {}

  async execute(query: GetCartByCustomerIdQuery): Promise<CartDto | null> {
    const { customerId } = query;

    const cart = await this.cartRepository.findByUniqueId(customerId);

    if (!cart) return null;

    return this.cartMapper.toDto(cart);
  }
}
