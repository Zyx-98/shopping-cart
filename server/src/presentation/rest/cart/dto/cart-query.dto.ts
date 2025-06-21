import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CartQueryDto {
  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Next cursor for pagination' })
  @IsOptional()
  nextCursor?: string;

  @ApiPropertyOptional({ description: 'Previous cursor for pagination' })
  @IsOptional()
  previousCursor?: string;
}
