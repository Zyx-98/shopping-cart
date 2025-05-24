import { Module } from '@nestjs/common';
import { RedisIdempotentModule } from './redis/redis-idempotent.module';

@Module({
  imports: [RedisIdempotentModule],
  exports: [RedisIdempotentModule],
})
export class IdempotentModule {}
