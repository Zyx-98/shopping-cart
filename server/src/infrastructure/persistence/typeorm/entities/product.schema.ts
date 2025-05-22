import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventorySchema } from './inventory.schema';
import { OrderLineSchema } from './order-line.schema';

@Entity('products')
export class ProductSchema {
  @PrimaryColumn({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric', name: 'item_price' })
  itemPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => InventorySchema, (inventory) => inventory.product, {
    cascade: true,
  })
  inventory: InventorySchema;

  @OneToMany(() => OrderLineSchema, (orderLine) => orderLine.product)
  orderLines: OrderLineSchema[];
}
