import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1743329171049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS payments (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL,
            state VARCHAR(50) NOT NULL,
            total_item_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            failed_at TIMESTAMP DEFAULT NULL,
            paid_at TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
        CREATE INDEX IF NOT EXISTS idx_payments_state ON payments(state);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_payments_order_id;
        DROP INDEX IF EXISTS idx_payments_state;
        DROP TABLE IF EXISTS payments;
        `);
  }
}
