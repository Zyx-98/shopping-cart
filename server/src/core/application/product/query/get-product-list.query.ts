import { QueryCriteria } from 'src/core/domain/shared/types/query-criteria.interface';

export class GetProductListQuery {
  constructor(public criteria: QueryCriteria) {}
}
