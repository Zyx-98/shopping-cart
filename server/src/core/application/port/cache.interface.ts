export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>; // ttl in seconds
  del(key: string): Promise<void>;
  reserveInventory(key: string, quantity: number): Promise<number>;
  compensateInventory(key: string, quantity: number): Promise<void>;
}

export const CACHE_SERVICE = Symbol('ICacheService');
