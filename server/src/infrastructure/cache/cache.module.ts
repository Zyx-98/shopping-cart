import { Global, Module } from '@nestjs/common';
import { RedisCacheModule } from './redis/redis-cache.module';

@Global()
@Module({
  imports: [RedisCacheModule],
  exports: [RedisCacheModule],
})
export class CacheModule {}
