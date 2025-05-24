import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderSchema } from './order.schema';

@Entity('payments')
export class PaymentSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'numeric', name: 'total_item_price' })
  totalItemPrice: number;

  @Column({ type: 'time with time zone', name: 'failed_at' })
  failedAt: Date | null;

  @Column({ type: 'time with time zone', name: 'paid_at' })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => OrderSchema)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'uuid' })
  order: OrderSchema;
}
