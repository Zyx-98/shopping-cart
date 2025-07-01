export enum QueueType {
  INVENTORY = 'inventory',
}

export enum QueueJobName {
  RESERVE_INVENTORY = 'reserve-inventory',
  RESERVE_INVENTORY_WITH_SINGLE_PRODUCT = 'reserve-inventory-with-single-product',
  COMPENSATE_INVENTORY = 'compensate-inventory',
  RELEASE_PRODUCT_RESERVATION = 'release_product_reservation',
}

export interface QueueJobData {
  [QueueJobName.RESERVE_INVENTORY]: {
    orderId: string;
    orderLines: Array<{ productId: string; quantity: number }>;
  };
  [QueueJobName.COMPENSATE_INVENTORY]: {
    orderId: string;
  };
  [QueueJobName.RESERVE_INVENTORY_WITH_SINGLE_PRODUCT]: {
    orderId: string;
    orderLine: { productId: string; quantity: number };
  };
  [QueueJobName.RELEASE_PRODUCT_RESERVATION]: {
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
