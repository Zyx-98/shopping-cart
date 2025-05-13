import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateItemQuantityRequestDto {
  @ApiProperty({
    description: 'The new quantity for the item',
    example: 3,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
