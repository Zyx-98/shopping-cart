/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, Observable, of, tap } from 'rxjs';
import {
  IDEMPOTENT_SERVICE,
  IIdempotencyService,
} from 'src/core/application/port/idempotency.interface';
import {
  IDEMPOTENCY_KEY_METADATA,
  IdempotencyOptions,
} from './idempotent.decorator';
import { Response } from 'express';

const IDEMPOTENCY_HEADER = 'Idempotency-Key';
const DEFAULT_RETENTION_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_PROCESSING_TIMEOUT_MS = 30 * 1000; // 30 seconds

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(IDEMPOTENT_SERVICE)
    private readonly idempotentService: IIdempotencyService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const idempotencyOptions = this.reflector.get<IdempotencyOptions>(
      IDEMPOTENCY_KEY_METADATA,
      handler,
    );

    if (!idempotencyOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const idempotencyKey = request.headers[IDEMPOTENCY_HEADER] as string;

    if (!idempotencyKey) {
      this.logger.warn(
        `Missing '${IDEMPOTENCY_HEADER}' header for an idempotent operation.`,
      );

      throw new HttpException(
        `'${IDEMPOTENCY_HEADER}' header is required for idempotent requests.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const retentionPeriodMs =
      idempotencyOptions.retentionPeriodMs || DEFAULT_RETENTION_PERIOD_MS;
    const processingTimeoutMs =
      idempotencyOptions.processingTimeoutMs || DEFAULT_PROCESSING_TIMEOUT_MS;

    try {
      const storeState = await this.idempotentService.checkAndSetProcessing(
        idempotencyKey,
        processingTimeoutMs,
      );

      if (storeState) {
        this.logger.log(
          `Idempotency key ${idempotencyKey} already exists with status: ${storeState.status}`,
        );

        switch (storeState.status) {
          case 'COMPLETED':
            response.status(storeState.httpStatusCode || HttpStatus.OK);
            return of(storeState.responseBody);
          case 'FAILED':
            throw new HttpException(
              storeState.responseBody || 'Previous request failed',
              storeState.httpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          case 'PROCESSING':
            throw new HttpException(
              'Request is already being processed by another instance. Please retry later.',
              HttpStatus.CONFLICT,
            );
        }
      }
      this.logger.log(
        `Idempotency key ${idempotencyKey} is new, proceeding with handler`,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : String(error);

      this.logger.error(
        `Error during idempotency check: ${idempotencyKey} ${errorMessage}`,
      );
      throw new HttpException(
        `Error processing idempotency key.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return next.handle().pipe(
      tap(async (data: any) => {
        this.logger.log(
          `Handler successful for idempotency key '${idempotencyKey}', Marking as COMPLETED`,
        );

        const currentStatusCode = response.statusCode || HttpStatus.OK;

        await this.idempotentService.markAsCompleted(
          idempotencyKey,
          {
            status: 'COMPLETED',
            responseBody: data,
            httpStatusCode: currentStatusCode,
          },
          retentionPeriodMs,
        );
      }),
      catchError(async (error) => {
        this.logger.warn(
          `Handler failed for idempotency key '${idempotencyKey}': ${error}`,
        );

        let errorStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: any = { message: 'An internal error occurred' };

        if (error instanceof HttpException) {
          errorStatusCode = error.getStatus();
          errorResponse = error.getResponse();
        } else if (error instanceof Error) {
          errorResponse = { message: error.message, name: error.name };
        } else {
          errorResponse = { message: String(error) };
        }

        await this.idempotentService.markAsFailed(
          idempotencyKey,
          {
            error: errorResponse,
            originalErrorName: error.name,
            httpStatusCode: errorStatusCode,
          },
          retentionPeriodMs,
        );

        throw error;
      }),
    );
  }
}
