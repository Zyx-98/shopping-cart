/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricService } from './metric.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class MetricInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricInterceptor.name);

  constructor(private readonly metricsService: MetricService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logAndMeasure(request, response.statusCode, start);
        },
        error: (err) => {
          const status = response.statusCode || 500;
          this.logAndMeasure(request, status, start, err);
        },
      }),
    );
  }

  private logAndMeasure(
    request: FastifyRequest,
    statusCode: number,
    start: bigint,
    error?: any,
  ) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000_000;

    const method = request.method;
    const path = request.url;

    const normalizedPath = this.normalizePath(path);

    this.metricsService.httpRequestTotal.inc({
      method,
      path: normalizedPath,
      status: statusCode,
    });

    this.metricsService.httpRequestDuration.observe(
      { method, path: normalizedPath, status: statusCode },
      duration,
    );

    this.logger.debug(
      `Request: ${method} ${normalizedPath} | Status: ${statusCode} | Duration: ${duration.toFixed(4)}s`,
    );

    if (error) {
      this.logger.error(`Error: ${error.message}`, error.stack);
    }
  }

  private normalizePath(path: string): string {
    return path
      .replace(
        /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\/|$)/g,
        '/:uuid$1',
      )
      .replace(/\/\d+(\/|$)/g, '/:id$1')
      .split('?')[0];
  }
}
