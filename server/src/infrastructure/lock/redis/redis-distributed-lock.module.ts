import { Module } from '@nestjs/common';
import { REDIS_DISTRIBUTED_LOCK_CLIENT } from './redis-distributed-lock.constant';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DISTRIBUTED_LOCK_SERVICE } from 'src/core/application/port/distributed-lock.interface';
import { RedisDistributedLockService } from './redis-distributed-lock.service';

@Module({
  providers: [
    {
      provide: REDIS_DISTRIBUTED_LOCK_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        return new Redis({
          host: configService.get<string>('REDIS_DISTRIBUTED_LOCK_HOST'),
          port: configService.get<number>('REDIS_DISTRIBUTED_LOCK_PORT'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: DISTRIBUTED_LOCK_SERVICE,
      useClass: RedisDistributedLockService,
    },
  ],
  exports: [REDIS_DISTRIBUTED_LOCK_CLIENT, DISTRIBUTED_LOCK_SERVICE],
})
export class RedisDistributedLockModule {}
