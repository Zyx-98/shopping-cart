import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;
}

export class OrderLineDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description?: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: () => ProductDto })
  product?: ProductDto | null;
}
