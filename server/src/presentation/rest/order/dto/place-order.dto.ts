import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number' },
      },
    },
    minItems: 1,
  })
  @IsNotEmpty()
  selectedProducts: {
    productId: string;
    quantity: number;
  }[];
}
