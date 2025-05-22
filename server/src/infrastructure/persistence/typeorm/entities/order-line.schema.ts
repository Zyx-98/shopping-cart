import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderSchema } from './order.schema';
import { ProductSchema } from './product.schema';

@Entity('order_lines')
export class OrderLineSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => OrderSchema, (order) => order.orderLines)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'uuid' })
  order?: OrderSchema;

  @ManyToOne(() => ProductSchema, (product) => product.orderLines)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'uuid' })
  product: ProductSchema;
}
