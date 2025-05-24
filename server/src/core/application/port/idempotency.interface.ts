export interface StoredResponse<T = any> {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responseBody?: T;
  httpStatusCode?: number;
}

export interface IIdempotencyService {
  checkAndSetProcessing(
    key: string,
    processingTimeoutMs: number,
  ): Promise<StoredResponse | null>;

  markAsCompleted<TResponse>(
    key: string,
    response: StoredResponse<TResponse>,
    retentionPeriodMs: number,
  ): Promise<void>;

  markAsFailed(
    key: string,
    errorDetails: any,
    retentionPeriodMs: number,
  ): Promise<void>;

  clear(key: string): Promise<void>;
}

export const IDEMPOTENT_SERVICE = Symbol('IIdempotentService');
