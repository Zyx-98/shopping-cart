import {
  PaginatedResult,
  PaginationParams,
  QueryCriteria,
} from '../../types/pagination.type';

export interface IPageLimitPaginationRepository<T> {
  findWithPageLimit(
    criteria: QueryCriteria,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<T>>;
}
