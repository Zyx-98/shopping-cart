import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;
}
