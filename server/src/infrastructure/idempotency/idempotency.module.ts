import { Global, Module } from '@nestjs/common';
import { RedisIdempotencyService } from './redis-idempotency.service';
import { IdempotencyInterceptor } from './itempotency.interceptor';
import { IDEMPOTENT_SERVICE } from 'src/core/application/port/idempotency.interface';

@Global()
@Module({
  providers: [
    {
      provide: IDEMPOTENT_SERVICE,
      useClass: RedisIdempotencyService,
    },
    IdempotencyInterceptor,
  ],
  exports: [IDEMPOTENT_SERVICE, IdempotencyInterceptor],
})
export class IdempotencyModule {}
