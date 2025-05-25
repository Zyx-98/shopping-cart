import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthInfrastructureModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './redis/redis.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { DistributedLockModule } from './distributed-lock/distributed-lock.module';

@Module({
  imports: [
    PersistenceModule,
    AuthInfrastructureModule,
    RedisModule,
    CacheModule,
    IdempotencyModule,
    DistributedLockModule,
  ],
  exports: [
    PersistenceModule,
    AuthInfrastructureModule,
    RedisModule,
    CacheModule,
    DistributedLockModule,
  ],
})
export class InfrastructureModule {}
