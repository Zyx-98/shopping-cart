import { Inject, Injectable } from '@nestjs/common';
import { IDistributedLockService } from 'src/core/application/port/distributed-lock.interface';
import Redis from 'ioredis';
import { v4 } from 'uuid';
import { REDIS_CLIENT } from '../redis/redis.constant';

@Injectable()
export class RedisDistributedLockService implements IDistributedLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}
  async acquire(
    lockName: string,
    lockTimeoutMs: number,
    retryAttempts: number = 0,
    retryDelayMs: number = 100,
  ): Promise<string | null> {
    const lockId = v4();
    const key = `lock:${lockName}`;

    for (let i = 0; i <= retryAttempts; i++) {
      const result = await this.redisClient.set(
        key,
        lockId,
        'PX',
        lockTimeoutMs,
        'NX',
      );

      if (result === 'OK') {
        return lockId;
      }

      if (i < retryAttempts) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    return null;
  }
  async release(lockName: string, lockId: string): Promise<boolean> {
    const key = `lock:${lockName}`;

    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `;

    const result = await this.redisClient.eval(script, 1, key, lockId);
    return result === 1;
  }
}
