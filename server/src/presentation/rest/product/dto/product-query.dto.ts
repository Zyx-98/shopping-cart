import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  FilterParams,
  SortParams,
} from 'src/core/domain/shared/types/pagination.type';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: `
    Object to filter items.

    ### Syntax:
    \`filter[fieldName][operator]=value\`

    ### Available Operators:
    - \`eq\`: Equals (=)
    - \`neq\`: Not equals (!=)
    - \`gt\`: Greater than (>)
    - \`gte\`: Greater than or equal to (>=)
    - \`lt\`: Less than (<)
    - \`lte\`: Less than or equal to (<=)
    - \`like\`: LIKE (case-sensitive)
    - \`ilike\`: ILIKE (case-insensitive)
    - \`in\`: IN (comma-separated values for arrays)
    - \`isNull\`: IS NULL (e.g., \`filter[fieldName][isNull]=true\`)
    - \`isNotNull\`: IS NOT NULL (e.g., \`filter[fieldName][isNotNull]=true\`)
    `,
    type: 'object',
    additionalProperties: false,
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
