import { Injectable } from '@nestjs/common';
import { CartAggregate } from 'src/core/domain/cart/aggregate/cart.aggregate';
import { CartDto, CartDtoWithCursorPagination } from '../dto/cart.dto';
import { CartItem } from 'src/core/domain/cart/entity/cart-item.entity';
import { CartItemDto } from '../dto/cart-item.dto';
import { CursorPaginatedResult } from 'src/core/domain/shared/types/pagination.type';

@Injectable()
export class CartMapper {
  public toDto(aggregate: CartAggregate): CartDto {
    const cartDto = new CartDto();

    cartDto.id = aggregate.id.toString();
    cartDto.totalPrice = aggregate.getTotalPrice().amount;
    cartDto.cartItems = aggregate.cartItems.map((item) => this.itemToDto(item));

    return cartDto;
  }

  public toDtoWithCursorPagination(aggregate: {
    cart: CartAggregate;
    pagination: Omit<CursorPaginatedResult<CartItem>, 'data'>;
  }): CartDtoWithCursorPagination {
    const cartDto = this.toDto(aggregate.cart);
    return {
      ...cartDto,
      pagination: aggregate.pagination,
    };
  }

  private itemToDto(entity: CartItem): CartItemDto {
    const cartItemDto = new CartItemDto();
    cartItemDto.productId = entity.productId.toString();
    cartItemDto.quantity = entity.quantity.toNumber();
    cartItemDto.unitPrice = entity.priceAtAddition.amount;

    return cartItemDto;
  }
}
