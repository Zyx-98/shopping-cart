import { Global, Module } from '@nestjs/common';
import { RedisDistributedLockModule } from './redis/redis-distributed-lock.module';

@Global()
@Module({
  imports: [RedisDistributedLockModule],
  exports: [RedisDistributedLockModule],
})
export class LockModule {}
