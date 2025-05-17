import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  FilterParams,
  PaginatedResult,
  QueryCriteria,
  SortParams,
} from 'src/core/domain/shared/types/query-criteria.interface';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

type Prev = [never, 0, 1, 2, 3, 4, ...Array<number>];
type Primitive =
  | string
  | number
  | boolean
  | Date
  | symbol
  | bigint
  | undefined
  | null;

type DeepKeys<T, D extends number = 3> = D extends Prev[0]
  ? never
  : T extends Primitive
    ? ''
    : T extends Array<infer U>
      ? DeepKeys<U, Prev[D]>
      : {
          [K in keyof T]-?: K extends string | number
            ? T[K] extends Primitive
              ? `${K}`
              : `${K}` | `${K}.${DeepKeys<T[K], Prev[D]>}`
            : never;
        }[keyof T];

const OPERATOR_MAP: { [key: string]: string } = {
  eq: '=',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'LIKE',
  ilike: 'ILIKE',
  in: 'IN',
  isNull: 'IS NULL',
  isNotNull: 'IS NOT NULL',
};

@Injectable()
export class TypeOrmQueryBuilderService {
  private readonly logger = new Logger(TypeOrmQueryBuilderService.name, {
    timestamp: true,
  });
  async buildQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    criteria: QueryCriteria,
    options: {
      alias?: string;
      allowedFilters?: Array<DeepKeys<T>>;
      allowedSorts?: Array<DeepKeys<T>>;
      defaultSort?: Array<SortParams<DeepKeys<T>>>;
      defaultLimit?: number;
      defaultPage?: number;
    },
  ): Promise<PaginatedResult<T>> {
    const alias = options?.alias ?? repository.metadata.tableName;
    const queryBuilder = repository.createQueryBuilder(alias);

    // Apply filters
    const filters = criteria.filter ?? {};
    this.applyFilters<T>(queryBuilder, filters, alias, options?.allowedFilters);

    // Apply sorting
    const defaultSort = options?.defaultSort ?? [
      { field: 'id', direction: 'ASC' },
    ];
    const sorts = criteria.sort?.length ? criteria.sort : defaultSort;
    this.applySorts<T>(queryBuilder, sorts, alias, options?.allowedSorts);

    // Apply pagination
    const page = criteria.pagination?.page ?? options?.defaultPage ?? 1;
    const limit = criteria.pagination?.limit ?? options?.defaultLimit ?? 10;
    const { skip: _skip, take } = this.applyPagination<T>(queryBuilder, {
      page,
      limit,
    });

    try {
      const [data, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / take);

      return {
        data,
        total,
        page,
        limit: take,
        totalPages,
      };
    } catch (error: unknown) {
      this.logger.error('Query execution failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Query failed. Check parameters or server logs. Original error: ${errorMessage}`,
      );
    }
  }

  private applyFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    filters: FilterParams,
    alias: string,
    allowedFilters?: string[],
  ) {
    let paramIndex = 0;
    Object.keys(filters).forEach((field) => {
      if (allowedFilters && !allowedFilters.includes(field)) {
        this.logger.warn(`Filtering ignored for disallowed field: ${field}`);
        return;
      }
      const condition = filters[field];
      Object.keys(condition).forEach((operator) => {
        const mappedOperator = OPERATOR_MAP[operator];
        if (!mappedOperator) {
          this.logger.warn(`Unsupport filter operator: ${operator}`);
          return;
        }
        const value = condition[operator];
        const paramName = `${field}_${operator}_${paramIndex++}`;
        const fieldName = `${alias}.${field}`;

        if (operator === 'isNull' || operator === 'isNotNull') {
          qb.andWhere(`${fieldName} ${mappedOperator}`);
        } else if (operator === 'in') {
          if (!Array.isArray(value) || value.length === 0) {
            qb.andWhere('1=0');
            return;
          }
          qb.andWhere(`${fieldName} ${mappedOperator} (:...${paramName})`, {
            [paramIndex]: value,
          });
        } else if (operator === 'like' || operator === 'ilike') {
          if (typeof value !== 'string') {
            this.logger.warn(
              `Value for '${operator}' on '${field}' must be a string.`,
            );
            return;
          }
          qb.andWhere(`${fieldName} ${mappedOperator} :${paramName}`, {
            [paramName]: `%${value}%`,
          });
        } else {
          qb.andWhere(`${fieldName} ${mappedOperator} :${paramName}`, {
            [paramName]: value,
          });
        }
      });
    });
  }

  private applySorts<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    sorts: SortParams[],
    alias: string,
    allowedSorts?: string[],
  ) {
    sorts.forEach((sort, index) => {
      if (allowedSorts && !allowedSorts.includes(sort.field)) {
        this.logger.warn(`Sorting ignored for disallowed field: ${sort.field}`);
        return;
      }
      const fieldName = `${alias}.${sort.field}`;
      if (index === 0) {
        qb.orderBy(fieldName, sort.direction);
      } else {
        qb.addOrderBy(fieldName, sort.direction);
      }
    });
  }

  private applyPagination<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    pagination: { page: number; limit: number },
  ): { skip: number; take: number } {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(100, pagination.limit || 10));
    const skip = (page - 1) * limit;
    const take = limit;
    qb.skip(skip).take(take);
    return { skip, take };
  }
}
