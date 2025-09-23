import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { JobRepository } from '../persistence/typeorm/repositories/queue.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueLoaderService implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueLoaderService.name);
  constructor(
    private readonly jobRepository: JobRepository,
    @InjectQueue('inventory') private readonly inventoryQueue: Queue,
  ) {}
  async onApplicationBootstrap() {
    this.logger.log('Starting job recovery process...');

    const waitingJobs = await this.jobRepository.findWaitingJobs();

    if (!waitingJobs.length) {
      this.logger.log('No waiting jobs found.');
      return;
    }

    this.logger.log(`Found ${waitingJobs.length} waiting jobs to check...`);

    for (const job of waitingJobs) {
      const jobInQueue = await this.inventoryQueue.getJob(job.jobId);

      if (!jobInQueue) {
        await this.inventoryQueue.add(job.queueName, job.data);
      }
    }

    this.logger.log('Job recovery process finished.');
  }
}
