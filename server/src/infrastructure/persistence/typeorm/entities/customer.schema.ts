import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSchema } from './user.schema';

@Entity('customers')
export class CustomerSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne((_) => UserSchema)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserSchema;
}
