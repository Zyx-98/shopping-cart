import { Module } from '@nestjs/common';
import { REDIS_IDEMPOTENT_CLIENT } from './redis-idempotent.constant';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IDEMPOTENT_SERVICE } from 'src/core/application/port/idempotency.interface';
import { RedisIdempotentService } from './redis-idempotent.service';

@Module({
  providers: [
    {
      provide: REDIS_IDEMPOTENT_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        return new Redis({
          host: configService.get<string>('REDIS_IDEMPOTENT_HOST'),
          port: configService.get<number>('REDIS_IDEMPOTENT_PORT'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: IDEMPOTENT_SERVICE,
      useClass: RedisIdempotentService,
    },
  ],
  exports: [REDIS_IDEMPOTENT_CLIENT, IDEMPOTENT_SERVICE],
})
export class RedisIdempotentModule {}
