import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'saga_instances' })
export class SagaInstanceSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ name: 'saga_type', type: 'varchar', length: 100 })
  sagaType: string;

  @Column({ name: 'correlation_id', type: 'uuid' })
  correlationId: string;

  @Column({ name: 'current_step', type: 'varchar', length: 100 })
  currentStep: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ name: 'is_compensating', type: 'boolean', default: false })
  isCompensating: boolean;

  @Column({ type: 'int', default: 0 })
  retries: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
