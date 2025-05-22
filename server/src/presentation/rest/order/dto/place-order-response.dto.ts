import { ApiProperty } from '@nestjs/swagger';

export class PlaceOrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0' })
  uuid: string;
}
