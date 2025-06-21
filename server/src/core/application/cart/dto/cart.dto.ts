import { ApiProperty } from '@nestjs/swagger';
import { CartItemDto } from './cart-item.dto';

export class CartDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [CartItemDto] })
  cartItems: CartItemDto[];

  @ApiProperty()
  totalPrice: number;
}

export class CartDtoWithCursorPagination extends CartDto {
  @ApiProperty()
  pagination: {
    limit: number;
    previousCursor?: string | null;
    nextCursor?: string | null;
    hasNextPage?: boolean;
    hasPrevious?: boolean;
  };
}
