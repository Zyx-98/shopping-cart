export interface FilterCondition {
  [operator: string]: string | number | boolean | string[] | number[];
}

export interface FilterParams {
  [field: string]: FilterCondition;
}

export interface SortParams<K = string> {
  field: K;
  direction: 'ASC' | 'DESC';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface QueryCriteria {
  filter?: FilterParams;
  sort?: SortParams[];
  pagination?: PaginationParams;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Cursor = string;

export interface CursorPaginatedResult<T> {
  data: T[];
  previousCursor: Cursor | null;
  nextCursor: Cursor | null;
  total: number;
}
