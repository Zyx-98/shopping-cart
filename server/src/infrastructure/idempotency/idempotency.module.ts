import { Module } from '@nestjs/common';
import { RedisIdempotencyService } from './redis-idempotency.service';

@Module({
  imports: [RedisIdempotencyService],
  exports: [RedisIdempotencyService],
})
export class IdempotencyModule {}
