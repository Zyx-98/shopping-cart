import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PayRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
