import {
  CursorPaginatedResult,
  CursorPaginationParams,
  QueryCriteria,
} from '../../types/pagination.type';

export interface ICursorPaginationRepository<T> {
  findWithCursorPagination(
    criteria: QueryCriteria,
    cursor: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<T>>;
}
