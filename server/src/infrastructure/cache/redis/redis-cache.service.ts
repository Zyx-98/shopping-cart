import { Inject, Injectable } from '@nestjs/common';
import { ICacheService } from 'src/core/application/port/cache.interface';
import { REDIS_CACHE_CLIENT } from './redis-cache.constant';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements ICacheService {
  //   private readonly logger = new Logger(RedisCacheService.name);

  constructor(
    @Inject(REDIS_CACHE_CLIENT) private readonly redisClient: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);

    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await this.redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
