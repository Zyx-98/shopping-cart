import { JobStatus } from 'src/core/application/port/queue.service';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class JobSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ name: 'job_id', unique: true })
  jobId: string;

  @Column({ name: 'queue_name' })
  queueName: string;

  @Column({ nullable: true })
  name?: string;

  @Column({
    type: 'jsonb',
  })
  data: object;

  @Column({
    type: 'varchar',
    enum: JobStatus,
    default: JobStatus.WAITING,
  })
  status: JobStatus;

  @Column({ type: 'smallint', default: 0 })
  progress: number;

  @Column({ type: 'jsonb', nullable: true })
  result?: object;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ name: 'processed_on', type: 'timestamptz', nullable: true })
  processedOn?: Date;

  @Column({ name: 'finished_on', type: 'timestamptz', nullable: true })
  finishedOn?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
