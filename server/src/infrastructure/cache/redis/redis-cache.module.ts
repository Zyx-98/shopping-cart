import { Module } from '@nestjs/common';
import { REDIS_CACHE_CLIENT } from './redis-cache.constant';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CACHE_SERVICE } from 'src/core/application/port/cache.interface';
import { RedisCacheService } from './redis-cache.service';

@Module({
  providers: [
    {
      provide: REDIS_CACHE_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        return new Redis({
          host: configService.get<string>('REDIS_CACHE_HOST'),
          port: configService.get<number>('REDIS_CACHE_PORT'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [REDIS_CACHE_CLIENT, CACHE_SERVICE],
})
export class RedisCacheModule {}
