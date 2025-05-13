import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartSchema } from './cart.schema';

@Entity('cart_items')
export class CartItemSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => CartSchema, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: CartSchema;
}
