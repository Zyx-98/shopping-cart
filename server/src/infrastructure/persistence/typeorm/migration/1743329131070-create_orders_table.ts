import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1743329131070 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS orders (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            customer_id UUID NOT NULL,
            coupon_id UUID NULL,
            state varchar(50) NOT NULL,
            invoice_path text NULL,
            canceled_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
        CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);
        CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_orders_customer_id;
        DROP INDEX IF EXISTS idx_orders_coupon_id;
        DROP INDEX IF EXISTS idx_orders_state;
        DROP TABLE IF EXISTS orders;
        `);
  }
}
