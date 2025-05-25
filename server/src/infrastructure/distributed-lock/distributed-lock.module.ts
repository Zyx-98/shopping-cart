import { Global, Module } from '@nestjs/common';
import { RedisDistributedLockService } from './redis-distributed-lock.service';

@Global()
@Module({
  imports: [RedisDistributedLockService],
  exports: [RedisDistributedLockService],
})
export class DistributedLockModule {}
