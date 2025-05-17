import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  FilterParams,
  SortParams,
} from 'src/core/domain/shared/types/pagination.type';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Filter item',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        eq: { type: 'any', description: 'Equals (=)' },
        neq: { type: 'any', description: 'Not equals (!=)' },
        gt: { type: 'any', description: 'Greater than (>)' },
        gte: { type: 'any', description: 'Greater than or equal to (>=)' },
        lt: { type: 'any', description: 'Less than (<)' },
        lte: { type: 'any', description: 'Less than or equal to (<=)' },
        like: { type: 'string', description: 'Like (case-sensitive)' },
        ilike: { type: 'string', description: 'ILike (case-insensitive)' },
        in: {
          type: 'array',
          items: { type: 'any' },
          description: 'In a list of values',
        },
        isNull: { type: 'boolean', description: 'Is null' },
        isNotNull: { type: 'boolean', description: 'Is not null' },
      },
    },
  })
  @IsOptional()
  filter?: FilterParams;

  @ApiPropertyOptional({
    description: 'Sort by fields',
  })
  @IsOptional()
  sort?: SortParams[];

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;
}
