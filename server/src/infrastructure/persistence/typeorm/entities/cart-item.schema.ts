import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartSchema } from './cart.schema';

@Entity('cart_items')
export class CartItemSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'uuid', name: 'product_id', nullable: false })
  productId: string;

  @Column({ type: 'uuid', name: 'cart_id', nullable: false })
  cartId: string;

  @ManyToOne(() => CartSchema, (cart) => cart.cartItems, {
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'uuid' })
  cart: CartSchema;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
