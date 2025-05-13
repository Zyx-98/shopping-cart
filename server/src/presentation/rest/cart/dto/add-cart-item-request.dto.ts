import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddCartItemRequestDto {
  @ApiProperty({
    description: 'UUID of the product to add',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Number of units to add',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
