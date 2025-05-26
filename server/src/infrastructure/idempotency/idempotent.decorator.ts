import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_KEY_METADATA = 'idempotency_options';

export interface IdempotencyOptions {
  retentionPeriodMs?: number;
  processingTimeoutMs?: number;
}

export const Idempotent = (options?: IdempotencyOptions) =>
  SetMetadata(IDEMPOTENCY_KEY_METADATA, options || {});
