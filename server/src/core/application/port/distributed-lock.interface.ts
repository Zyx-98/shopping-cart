export interface IDistributedLockService {
  acquire(
    lockName: string,
    lockTimeoutMs: number,
    retryAttempts?: number,
    retryDelayMs?: number,
  ): Promise<string | null>;
  release(lockName: string, lockId: string): Promise<boolean>;
}

export const DISTRIBUTED_LOCK_SERVICE = Symbol('IDistributedLockService');
