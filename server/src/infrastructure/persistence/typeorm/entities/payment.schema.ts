import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class PaymentSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'numeric', name: 'total_item_price' })
  totalItemPrice: number;

  @Column({ type: 'time with time zone', name: 'failed_at' })
  failedAt?: Date | null;

  @Column({ type: 'time with time zone', name: 'paid_at' })
  paidAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
