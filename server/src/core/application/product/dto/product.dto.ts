import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  inventoryCount: number;
}
