import { Global, Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [RedisCacheService],
  exports: [RedisCacheService],
})
export class CacheModule {}
