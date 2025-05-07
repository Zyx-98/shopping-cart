import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1743329171049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            uuid UUID NOT NULL UNIQUE,
            order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            state VARCHAR(50) NOT NULL,
            total_item_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            failed_at TIMESTAMP DEFAULT NULL,
            paid_at TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS payments;
        `);
  }
}
