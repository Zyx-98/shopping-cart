import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CartSchema } from './cart.schema';

@Entity('cart_items')
export class CartItemSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @ManyToOne(() => CartSchema, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'uuid' })
  cart: CartSchema;
}
