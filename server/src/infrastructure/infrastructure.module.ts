import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthInfrastructureModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './redis/redis.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { DistributedLockModule } from './distributed-lock/distributed-lock.module';
import { MetricModule } from './metric/metric.module';
import { LoggerModule } from './logging/logger.module';

@Module({
  imports: [
    PersistenceModule,
    AuthInfrastructureModule,
    RedisModule,
    CacheModule,
    IdempotencyModule,
    DistributedLockModule,
    MetricModule,
    LoggerModule,
  ],
  exports: [
    PersistenceModule,
    AuthInfrastructureModule,
    RedisModule,
    CacheModule,
    DistributedLockModule,
    MetricModule,
  ],
})
export class InfrastructureModule {}
