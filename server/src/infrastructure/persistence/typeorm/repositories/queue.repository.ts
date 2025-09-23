import { DataSource, Repository } from 'typeorm';
import { JobSchema } from '../entities/jobs.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { JobStatus } from 'src/core/application/port/queue.service';
import { Job } from 'bullmq';
import { v7 } from 'uuid';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(JobSchema)
    private readonly ormRepository: Repository<JobSchema>,
    private readonly dataSource: DataSource,
  ) {}

  async findWaitingJobs(): Promise<JobSchema[]> {
    return this.ormRepository.find({
      where: { status: JobStatus.WAITING },
    });
  }

  async findByJobId(jobId: string): Promise<JobSchema | null> {
    return this.ormRepository.findOne({ where: { jobId } });
  }

  async store(callback: () => Promise<Job<any, any, string>>): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const bullJob = await callback();

      await manager.withRepository(this.ormRepository).save({
        jobId: bullJob.id,
        status: JobStatus.WAITING,
        uuid: v7(),
        queueName: bullJob.queueName,
        name: bullJob.name,
        data: bullJob.data as object,
      });
    });
  }

  async updateStatus(jobId: string, status: JobStatus): Promise<void> {
    await this.ormRepository.update({ jobId }, { status });
  }
}
