import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderLineSchema } from './order-line.schema';
import { CustomerSchema } from './customer.schema';
import { CouponSchema } from './coupon.schema';

@Entity('orders')
export class OrderSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({ name: 'invoice_path', type: 'text', nullable: true })
  invoicePath: string | null;

  @Column({ name: 'canceled_at', type: 'time with time zone', nullable: true })
  canceledAt: Date | null;

  @Column({ name: 'completed_at', type: 'time with time zone', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => OrderLineSchema, (orderLine) => orderLine.order)
  orderLines: OrderLineSchema[];

  @ManyToOne(() => CustomerSchema, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'uuid' })
  customer: CustomerSchema;

  @ManyToOne(() => CouponSchema, (coupon) => coupon.orders)
  @JoinColumn({ name: 'coupon_id', referencedColumnName: 'uuid' })
  coupon?: CouponSchema;
}
