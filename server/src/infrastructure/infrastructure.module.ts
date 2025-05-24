import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthInfrastructureModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { IdempotentModule } from './idempotent/idempotent.module';
import { LockModule } from './lock/lock.module';

@Module({
  imports: [
    PersistenceModule,
    AuthInfrastructureModule,
    CacheModule,
    IdempotentModule,
    LockModule,
  ],
  exports: [
    PersistenceModule,
    AuthInfrastructureModule,
    CacheModule,
    IdempotentModule,
    LockModule,
  ],
})
export class InfrastructureModule {}
