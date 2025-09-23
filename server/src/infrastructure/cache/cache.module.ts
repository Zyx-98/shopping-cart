import { Global, Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CACHE_SERVICE } from 'src/core/application/port/cache.interface';

@Global()
@Module({
  providers: [{ provide: CACHE_SERVICE, useClass: RedisCacheService }],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
