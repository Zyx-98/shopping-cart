import { Inject, Injectable } from '@nestjs/common';
import { ICacheService } from 'src/core/application/port/cache.interface';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constant';

@Injectable()
export class RedisCacheService implements ICacheService {
  //   private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
    this.redisClient.defineCommand('reserveInventory', {
      numberOfKeys: 1,
      lua: `
        local stock = tonumber(redis.call('GET', KEYS[1]))
        local quantity = tonumber(ARGV[1])
        redis.log(redis.LOG_NOTICE, "KEYS[1]: " .. tostring(KEYS[1]))
        redis.log(redis.LOG_NOTICE, "ARGV[1]: " .. tostring(ARGV[1]))
        redis.log(redis.LOG_NOTICE, "stock: " .. tostring(stock) .. ", quantity: " .. tostring(quantity))
        if stock and stock >= quantity then
          return redis.call('DECRBY', KEYS[1], quantity)
        else
          return -1
        end
      `,
    });
  }

  reserveInventory(key: string, quantity: number): Promise<number> {
    return (
      this.redisClient as Redis & {
        reserveInventory: (key: string, quantity: number) => Promise<number>;
      }
    ).reserveInventory(key, quantity);
  }

  async compensateInventory(key: string, quantity: number): Promise<void> {
    await this.redisClient.incrby(key, quantity);
  }

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
