import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetricSecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricSecurityInterceptor.name);
  private readonly expectedHeader = 'x-metric-secret-key';
  private readonly expectedKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.expectedKey = this.configService.get<string>('METRIC_SECRET_KEY');

    if (!this.expectedKey) {
      this.logger.error(
        'METRIC_SECRET_KEY is not defined in the configuration. Metrics endpoint will be insecure or inaccessible.',
      );
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const clientIp = request.ip;

    const receivedKey = request.headers[this.expectedHeader] as string;

    this.logger.log(
      `Metrics access attempt from IP: ${clientIp} with header ${this.expectedHeader}: ${receivedKey ? 'present' : 'missing'}`,
    );

    if (receivedKey && receivedKey === this.expectedKey) {
      this.logger.log(
        `Allowed access with valid key from IP: ${clientIp} for metrics endpoint.`,
      );
      return next.handle();
    } else {
      if (!receivedKey) {
        this.logger.warn(
          `Forbidden: Missing '${this.expectedHeader}' header from IP: ${clientIp}.`,
        );
      } else {
        this.logger.warn(
          `Forbidden: Invalid key in '${this.expectedHeader}' header from IP: ${clientIp}.`,
        );
      }
      throw new HttpException(
        'Access to metrics is restricted. Invalid or missing authentication key.',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
