import { Inject, Injectable } from '@nestjs/common';
import { IDistributedLockService } from 'src/core/application/port/distributed-lock.interface';
import { REDIS_DISTRIBUTED_LOCK_CLIENT } from './redis-distributed-lock.constant';
import Redis from 'ioredis';
import { v4 } from 'uuid';

@Injectable()
export class RedisDistributedLockService implements IDistributedLockService {
  constructor(
    @Inject(REDIS_DISTRIBUTED_LOCK_CLIENT) private readonly redisClient: Redis,
  ) {}
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
