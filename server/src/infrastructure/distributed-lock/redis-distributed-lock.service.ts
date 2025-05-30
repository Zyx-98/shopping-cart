import { Inject, Injectable } from '@nestjs/common';
import { IDistributedLockService } from 'src/core/application/port/distributed-lock.interface';
import Redis from 'ioredis';
import { v4 } from 'uuid';
import { REDIS_CLIENT } from '../redis/redis.constant';

const DISTRIBUTED_LOCK_KEY_PREFIX = 'lock:';
const DEFAULT_BACKOFF_FACTOR = 2;
const DEFAULT_MAX_BACKOFF_DELAY_MS = 5000;
const JITTER_FACTOR = 0.2;

@Injectable()
export class RedisDistributedLockService implements IDistributedLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  private getKey(lockName: string) {
    return `${DISTRIBUTED_LOCK_KEY_PREFIX}${lockName}`;
  }

  async acquire(
    lockName: string,
    lockTimeoutMs: number,
    retryAttempts: number = 0,
    retryDelayMs: number = 100,
  ): Promise<string | null> {
    const lockId = v4();
    const key = this.getKey(lockName);
    let currentDelay = retryDelayMs;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      if (attempt > 0) {
        if (retryAttempts > 0 && retryDelayMs > 0) {
          if (attempt > 1) {
            currentDelay = Math.min(
              currentDelay * DEFAULT_BACKOFF_FACTOR,
              DEFAULT_MAX_BACKOFF_DELAY_MS,
            );
          } else {
            currentDelay = retryDelayMs;
          }

          const jitter = (Math.random() * 2 - 1) * currentDelay * JITTER_FACTOR;
          const delayWithJitter = Math.max(
            0,
            Math.round(currentDelay + jitter),
          );
          await new Promise((resolve) => setTimeout(resolve, delayWithJitter));
        } else if (retryDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }

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
    }

    return null;
  }
  async release(lockName: string, lockId: string): Promise<boolean> {
    const key = this.getKey(lockName);

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
