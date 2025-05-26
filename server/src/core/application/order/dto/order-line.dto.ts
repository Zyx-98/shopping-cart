import { ApiProperty } from '@nestjs/swagger';

export class ProductDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class OrderLineDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description?: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  priceAtTimeOfOrder: string;

  @ApiProperty()
  productDetail: ProductDetailDto;
}
