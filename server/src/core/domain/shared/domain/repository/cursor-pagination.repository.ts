import {
  CursorPaginatedResult,
  CursorPaginationParams,
  QueryCriteria,
} from '../../types/pagination.type';

export interface ICursorPaginationRepository<T> {
  findWithPageLimit(
    criteria: QueryCriteria,
    cursor: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<T>>;
}
