import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerSchema } from './customer.schema';
import { CartItemSchema } from './cart-item.schema';

@Entity('carts')
export class CartSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @OneToOne((_) => CustomerSchema)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'uuid' })
  customer: CustomerSchema;

  @OneToMany(() => CartItemSchema, (cartItem) => cartItem.cart, {
    cascade: true,
  })
  cartItems: CartItemSchema[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
