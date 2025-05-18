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

export interface CursorPaginationParams {
  limit?: number;
  nextCursor?: string;
  previousCursor?: string;
}

export interface QueryCriteria {
  filter?: FilterParams;
  sort?: SortParams[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  limit: number;
  previousCursor?: string | null;
  nextCursor?: string | null;
  hasNextPage?: boolean;
  hasPrevious?: boolean;
}
