import { QueryCriteria } from 'src/core/domain/shared/types/pagination.type';

export class GetProductListQuery {
  constructor(public criteria: QueryCriteria) {}
}
