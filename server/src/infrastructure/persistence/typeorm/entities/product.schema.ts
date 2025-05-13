import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric' })
  itemPrice: number;
}
