import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1743329131070 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            uuid UUID NOT NULL UNIQUE,
            cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            coupon_id INT NULL REFERENCES coupons(id) ON DELETE CASCADE,
            state varchar(50) NOT NULL,
            invoice_path text NULL,
            canceled_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS orders;
        `);
  }
}
