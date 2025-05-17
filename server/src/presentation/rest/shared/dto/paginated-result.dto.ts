import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from 'src/core/domain/shared/types/query-criteria.interface';

export class PaginatedResultDto<T> implements PaginatedResult<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
