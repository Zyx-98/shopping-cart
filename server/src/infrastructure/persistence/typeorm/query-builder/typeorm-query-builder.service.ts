import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CursorPaginationParams,
  FilterParams,
  PaginatedResult,
  PaginationParams,
  QueryCriteria,
  SortParams,
} from 'src/core/domain/shared/types/pagination.type';
import {
  Brackets,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

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

interface DecodedCursor {
  [key: string]: any;
}

@Injectable()
export class TypeOrmQueryBuilderService {
  private readonly logger = new Logger(TypeOrmQueryBuilderService.name, {
    timestamp: true,
  });

  async buildQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    criteria: QueryCriteria & { pagination: PaginationParams },
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

  async buildQueryWithCursor<T extends ObjectLiteral>(
    repository: Repository<T>,
    criteria: QueryCriteria,
    cursorPagination: CursorPaginationParams,
    options: {
      alias?: string;
      allowedFilters?: Array<DeepKeys<T>>;
      allowedSorts?: Array<DeepKeys<T>>;
      defaultSort?: Array<SortParams<DeepKeys<T>>>;
      defaultLimit?: number;
      defaultPage?: number;
    },
  ) {
    const alias = options?.alias ?? repository.metadata.tableName;
    const queryBuilder = repository.createQueryBuilder(alias);
    const { nextCursor, previousCursor, limit = 20 } = cursorPagination;

    // Apply filters
    const filters = criteria.filter ?? {};

    this.applyFilters<T>(queryBuilder, filters, alias, options?.allowedFilters);

    // Apply sorting
    const defaultSort = options?.defaultSort ?? [
      { field: 'id', direction: 'ASC' },
    ];
    const sorts = criteria.sort?.length ? criteria.sort : defaultSort;
    let actualSorts = JSON.parse(JSON.stringify(sorts)) as SortParams[];
    let seekingPrevious = false;

    if (previousCursor) {
      seekingPrevious = true;
      actualSorts = actualSorts.map((sort) => ({
        ...sort,
        direction: sort.direction === 'ASC' ? 'DESC' : 'ASC',
      }));
    }

    this.applySorts<T>(queryBuilder, actualSorts, alias, options?.allowedSorts);

    const cursorToDecode = nextCursor || previousCursor;

    if (cursorToDecode) {
      try {
        const decoded = this.decodeCursor(cursorToDecode);
        this.applyCursorCondition<T>(queryBuilder, decoded, actualSorts, alias);
      } catch (error) {
        this.logger.warn(`Invalid cursor provided: ${cursorToDecode}`, error);
        throw new BadRequestException('Invalid cursor format.');
      }
    }

    queryBuilder.take(limit + 1);

    try {
      const items = await queryBuilder.getMany();

      const hasMore = items.length > limit;
      if (hasMore) {
        items.pop();
      }

      let hasNextPage = false;
      let hasPreviousPage = false;

      if (seekingPrevious) {
        items.reverse();
        hasNextPage = !!nextCursor || hasMore;
        hasPreviousPage = hasMore;
      } else {
        hasNextPage = hasMore;
        hasPreviousPage = !!nextCursor;
      }

      const nextItemCursor =
        (seekingPrevious ? hasNextPage : hasNextPage) && items.length > 0
          ? this.encodeCursor(items[items.length - 1], sorts)
          : null;
      const previousItemCursor =
        (seekingPrevious ? hasPreviousPage : hasPreviousPage) &&
        items.length > 0
          ? this.encodeCursor(items[0], sorts)
          : null;

      return {
        data: items,
        limit,
        nextCursor: nextItemCursor,
        previousCursor: previousItemCursor,
        hasNextPage: seekingPrevious
          ? !!nextCursor ||
            items.length === limit + 1 ||
            (items.length > 0 && hasMore)
          : hasNextPage,
        hasPreviousPage: seekingPrevious
          ? hasPreviousPage
          : !!nextCursor || (items.length > 0 && hasMore && !!previousCursor),
      };
    } catch (error) {
      this.logger.error(`Cursor query execution failed: ${error}`);
      throw new BadRequestException(
        `Query failed. Check parameters or server logs. Error: ${error}`,
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

  private encodeCursor<T extends ObjectLiteral>(item: T, sorts: SortParams[]) {
    const cursorPayload: DecodedCursor = {};
    sorts.forEach((sort) => {
      let currentPropertyValue: unknown = item;
      const parts = sort.field.split('.');

      for (const part of parts) {
        if (
          typeof currentPropertyValue === 'object' &&
          currentPropertyValue !== null
        ) {
          if (Reflect.has(currentPropertyValue, part)) {
            currentPropertyValue = (
              currentPropertyValue as Record<string, unknown>
            )[part];
          } else {
            this.logger.warn(
              `Cannot access sort field part '${part}' in field '${sort.field}' for item while encoding cursor. Part not found.`,
            );
            currentPropertyValue = null;
            break;
          }
        } else {
          this.logger.warn(
            `Cannot traverse sort field '${sort.field}'. Current segment is not an object or is null at part '${part}'.`,
          );
          currentPropertyValue = null;
          break;
        }
      }

      const payloadKey = sort.field.replace(/\./g, '_');
      cursorPayload[payloadKey] = currentPropertyValue; // currentPropertyValue is 'unknown' here.
    });
    return Buffer.from(JSON.stringify(cursorPayload)).toString('base64url');
  }

  private decodeCursor(cursor: string): DecodedCursor {
    try {
      const jsonString = Buffer.from(cursor, 'base64url').toString('utf-8');
      const parsed: DecodedCursor = JSON.parse(jsonString) as DecodedCursor;
      return parsed;
    } catch (e) {
      this.logger.error(`Failed to decode cursor: ${cursor}`, e);
      throw new Error('Invalid cursor encoding');
    }
  }

  private applyCursorCondition<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    decodedCursor: DecodedCursor,
    sorts: SortParams[],
    alias: string,
  ): void {
    qb.andWhere(
      new Brackets((subQuery) => {
        for (let i = 0; i < sorts.length; i++) {
          const conditions = new Brackets((innerSubQuery) => {
            for (let j = 0; j < i; j++) {
              const sortField = sorts[j].field;
              const cursorValue: unknown = decodedCursor[sortField];
              const paramName = `cursorValue_${sortField}_eq_${j}`;
              innerSubQuery.andWhere(`${alias}.${sortField} = :${paramName}`, {
                [paramName]: cursorValue,
              });
            }

            const sortField = sorts[i].field;
            const cursorValue: unknown = decodedCursor[sortField];
            const direction = sorts[i].direction;

            const operator = direction === 'ASC' ? '>' : '<';

            const paramName = `cursorValue_${sortField}_op_${i}`;

            innerSubQuery.andWhere(
              `${alias}.${sortField} ${operator} :${paramName}`,
              { [paramName]: cursorValue },
            );

            subQuery.orWhere(conditions);
          });
        }
      }),
    );
  }
}
