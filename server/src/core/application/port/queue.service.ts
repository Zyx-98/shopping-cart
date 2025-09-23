export enum QueueType {
  INVENTORY = 'inventory',
}

export enum QueueJobName {
  RESERVE_INVENTORY = 'reserve-inventory',
  COMPENSATE_INVENTORY = 'compensate-inventory',
}

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
}

export interface QueueJobData {
  [QueueJobName.RESERVE_INVENTORY]: {
    productId: string;
    quantity: number;
  };
  [QueueJobName.COMPENSATE_INVENTORY]: {
    productId: string;
    quantity: number;
  };
}

export interface IQueueService {
  addJob<T extends QueueJobName>(
    jobType: QueueType,
    jobName: T,
    data: QueueJobData[T],
  ): Promise<void>;
}

export const QUEUE_SERVICE = Symbol('IQueueService');
