import { Inject } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repository/cart.repository';
import { CartMapper } from '../../mapper/cart.mapper';
import { GetCartByCustomerIdQuery } from './get-cart-by-customer-id.query';
import { CartDtoWithCursorPagination } from '../../dto/cart.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetCartByCustomerIdQuery)
export class GetCartByCustomerIdHandler
  implements
    IQueryHandler<GetCartByCustomerIdQuery, CartDtoWithCursorPagination | null>
{
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly cartMapper: CartMapper,
  ) {}

  async execute(
    query: GetCartByCustomerIdQuery,
  ): Promise<CartDtoWithCursorPagination | null> {
    const { customerId, cursor } = query;

    const cart =
      await this.cartRepository.findByCustomerIdWithCursorPaginatedCartItems(
        customerId,
        cursor,
      );

    if (!cart) return null;

    return this.cartMapper.toDtoWithCursorPagination(cart);
  }
}
