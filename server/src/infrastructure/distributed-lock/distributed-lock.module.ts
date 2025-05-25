import { Global, Module } from '@nestjs/common';
import { RedisDistributedLockService } from './redis-distributed-lock.service';

@Global()
@Module({
  providers: [RedisDistributedLockService],
  exports: [RedisDistributedLockService],
})
export class DistributedLockModule {}
