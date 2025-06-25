import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSchema } from './product.schema';

@Entity('inventories')
export class InventorySchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => ProductSchema)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'uuid' })
  product: ProductSchema;
}
