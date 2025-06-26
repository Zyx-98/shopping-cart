export enum QueueType {
  INVENTORY = 'inventory',
}

export enum QueueJobName {
  RESERVE_INVENTORY = 'reserve-inventory',
  COMPENSATE_INVENTORY = 'compensate-inventory',
}

export interface QueueJobData {
  [QueueJobName.RESERVE_INVENTORY]: {
    orderId: string;
  };
  [QueueJobName.COMPENSATE_INVENTORY]: {
    orderId: string;
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
