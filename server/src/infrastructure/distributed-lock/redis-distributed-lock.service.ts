import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDistributedLockService } from 'src/core/application/port/distributed-lock.interface';
import Redis from 'ioredis';
import { v4 } from 'uuid';
import { REDIS_CLIENT } from '../redis/redis.constant';

const DISTRIBUTED_LOCK_KEY_PREFIX = 'lock:';

@Injectable()
export class RedisDistributedLockService implements IDistributedLockService {
  private readonly logger = new Logger(RedisDistributedLockService.name);

  private readonly backoffFactor: number;
  private readonly maxBackoffDelay: number;
  private readonly jitterFactor: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.backoffFactor = this.configService.get<number>(
      'LOCK_BACKOFF_FACTOR',
      2,
    );
    this.maxBackoffDelay = this.configService.get<number>(
      'LOCK_MAX_BACKOFF_MS',
      5000,
    );
    this.jitterFactor = this.configService.get<number>(
      'LOCK_JITTER_FACTOR',
      0.2,
    );
  }

  private getKey(lockName: string): string {
    return `${DISTRIBUTED_LOCK_KEY_PREFIX}${lockName}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
        currentDelay = Math.min(
          currentDelay * this.backoffFactor,
          this.maxBackoffDelay,
        );

        const jitter =
          (Math.random() - 0.5) * 2 * currentDelay * this.jitterFactor;
        const delayWithJitter = Math.round(Math.max(0, currentDelay + jitter));

        this.logger.debug(
          `Waiting for ${delayWithJitter} ms before retry attempt #${attempt + 1} for lock "${lockName}"`,
        );
        await this.delay(delayWithJitter);
      }

      this.logger.debug(
        `Attempt #${attempt + 1} to acquire lock "${lockName}" with ID "${lockId}"`,
      );

      const result = await this.redisClient.set(
        key,
        lockId,
        'PX',
        lockTimeoutMs,
        'NX',
      );

      if (result === 'OK') {
        this.logger.debug(
          `Successfully acquired lock "${lockName}" with ID "${lockId}"`,
        );
        return lockId;
      }
    }

    this.logger.warn(
      `Failed to acquire lock "${lockName}" after ${retryAttempts + 1} attempts.`,
    );
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

    try {
      const result = await this.redisClient.eval(script, 1, key, lockId);
      const released = result === 1;
      if (released) {
        this.logger.debug(
          `Successfully released lock "${lockName}" with ID "${lockId}"`,
        );
      } else {
        this.logger.warn(
          `Failed to release lock "${lockName}". It may have expired or been acquired by another process.`,
        );
      }
      return released;
    } catch (error) {
      this.logger.error(
        `Error releasing lock "${lockName}": ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async releaseMultiple(
    lockNames: string[],
    lockIds: string[],
  ): Promise<boolean> {
    if (lockNames.length !== lockIds.length) {
      this.logger.error(
        'Mismatched number of lock names and IDs provided for release.',
      );
      return false;
    }

    const script = `
        for i = 1, #KEYS do
            if redis.call("GET", KEYS[i]) == ARGV[i] then
                redis.call("DEL", KEYS[i])
            end
        end
        return 1
    `;

    try {
      const keys = lockNames.map((name) => this.getKey(name));
      const result = await this.redisClient.eval(
        script,
        keys.length,
        ...keys,
        ...lockIds,
      );
      const released = result === 1;
      if (released) {
        this.logger.debug(
          `Successfully released multiple locks: ${lockNames.join(', ')}`,
        );
      } else {
        this.logger.warn(
          `Failed to release some locks. They may have expired or been acquired by another process.`,
        );
      }
      return released;
    } catch (error) {
      this.logger.error(
        `Error releasing multiple locks: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
