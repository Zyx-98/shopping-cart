import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  IIdempotencyService,
  StoredResponse,
} from 'src/core/application/port/idempotency.interface';
import { REDIS_IDEMPOTENT_CLIENT } from './redis-idempotent.constant';

const IDEMPOTENT_KEY_PREFIX = 'idempotency:';

@Injectable()
export class RedisIdempotentService implements IIdempotencyService {
  private readonly logger = new Logger(RedisIdempotentService.name);

  private getKey(key: string): string {
    return `${IDEMPOTENT_KEY_PREFIX}${key}`;
  }

  constructor(
    @Inject(REDIS_IDEMPOTENT_CLIENT) private readonly redisClient: Redis,
  ) {}

  async checkAndSetProcessing(
    key: string,
    processingTimeoutMs: number,
  ): Promise<StoredResponse | null> {
    const redisKey = this.getKey(key);
    const existingValue = await this.redisClient.get(redisKey);

    if (existingValue) {
      try {
        const storedData = JSON.parse(existingValue) as StoredResponse;

        if (storedData.status === 'PROCESSING') {
          this.logger.warn(`Idempotency key ${key} is already processing.`);
        }
        return storedData;
      } catch (e) {
        this.logger.error(
          `Failed to parse stored idempotency data for key ${key}`,
          e,
        );

        return null;
      }
    }

    const processingMarker: StoredResponse = { status: 'PROCESSING' };
    const result = await this.redisClient.set(
      redisKey,
      JSON.stringify(processingMarker),
      'PX',
      processingTimeoutMs,
      'NX',
    );

    if (result === 'OK') {
      this.logger.log(`Idempotency key ${key} marked as PROCESSING.`);
      return null;
    } else {
      this.logger.warn(
        `Race condition for idempotency key ${key}. Re-fetching.`,
      );
      const updatedValue = await this.redisClient.get(redisKey);

      if (updatedValue) {
        return JSON.parse(updatedValue) as StoredResponse;
      }

      throw new Error(
        `Failed to acquire processing lock for idempotency key ${key} after race condition.`,
      );
    }
  }

  async markAsCompleted<TResponse>(
    key: string,
    response: StoredResponse<TResponse>,
    retentionPeriodMs: number,
  ): Promise<void> {
    const redisKey = this.getKey(key);

    if (response.status !== 'COMPLETED') {
      throw new Error(
        'Response status must be COMPLETED to mark as completed.',
      );
    }

    await this.redisClient.set(
      redisKey,
      JSON.stringify(response),
      'PX',
      retentionPeriodMs,
    );

    this.logger.log(`Idempotency key ${key} marked as COMPLETED.`);
  }

  async markAsFailed(
    key: string,
    errorDetails: any,
    retentionPeriodMs: number,
  ): Promise<void> {
    const redisKey = this.getKey(key);
    const storedError: StoredResponse = {
      status: 'FAILED',
      responseBody: errorDetails as object,
    };

    await this.redisClient.set(
      redisKey,
      JSON.stringify(storedError),
      'PX',
      retentionPeriodMs,
    );

    this.logger.log(`Idempotency key ${key} marked as FAILED`);
  }

  async clear(key: string): Promise<void> {
    const redisKey = this.getKey(key);
    await this.redisClient.del(redisKey);

    this.logger.log(`Idempotency key ${key} cleared`);
  }
}
