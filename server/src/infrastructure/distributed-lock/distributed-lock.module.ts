import { Global, Module } from '@nestjs/common';
import { RedisDistributedLockService } from './redis-distributed-lock.service';
import { DISTRIBUTED_LOCK_SERVICE } from 'src/core/application/port/distributed-lock.interface';

@Global()
@Module({
  providers: [
    {
      provide: DISTRIBUTED_LOCK_SERVICE,
      useClass: RedisDistributedLockService,
    },
  ],
  exports: [DISTRIBUTED_LOCK_SERVICE],
})
export class DistributedLockModule {}
