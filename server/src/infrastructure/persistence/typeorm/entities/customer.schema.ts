import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserSchema } from './user.schema';
import { OrderSchema } from './order.schema';

@Entity('customers')
export class CustomerSchema {
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne((_) => UserSchema)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'uuid' })
  user: UserSchema;

  @OneToMany(() => OrderSchema, (order) => order.customer)
  orders: OrderSchema[];
}
