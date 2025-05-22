import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { OrderSchema } from './order.schema';

@Entity('coupons')
export class CouponSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int' })
  reduction: number;

  @CreateDateColumn({ type: 'time with time zone', name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ type: 'time with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderSchema, (order) => order.coupon)
  orders: OrderSchema[];
}
