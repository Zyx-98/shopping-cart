import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IQueueService,
  QueueJobData,
  QueueJobName,
  QueueType,
} from 'src/core/application/port/queue.service';
import { JobRepository } from '../persistence/typeorm/repositories/queue.repository';

export class BullQueueService implements IQueueService {
  constructor(
    @InjectQueue('inventory') private readonly inventoryQueue: Queue,
    private readonly jobRepository: JobRepository,
  ) {}
  async addJob<T extends QueueJobName>(
    jobType: QueueType,
    jobName: T,
    data: QueueJobData[T],
  ): Promise<void> {
    switch (jobType) {
      case QueueType.INVENTORY:
        await this.jobRepository.store(() =>
          this.inventoryQueue.add(jobName, data),
        );
        break;
      default:
        break;
    }
  }
}
