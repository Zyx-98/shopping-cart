import { Module } from '@nestjs/common';
import { RedisIdempotencyService } from './redis-idempotency.service';

@Module({
  providers: [RedisIdempotencyService],
  exports: [RedisIdempotencyService],
})
export class IdempotencyModule {}
