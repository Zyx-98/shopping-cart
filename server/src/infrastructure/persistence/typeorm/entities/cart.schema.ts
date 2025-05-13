import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerSchema } from './customer.schema';
import { CartItemSchema } from './cart-item.schema';

@Entity('carts')
export class CartSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'int' })
  customerId: number;

  @OneToOne((_) => CustomerSchema)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: CustomerSchema;

  @OneToMany(() => CartItemSchema, (cartItem) => cartItem.cart)
  cartItems: CartItemSchema[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
