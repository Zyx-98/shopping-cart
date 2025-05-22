import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartsTable1743329095907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS carts (
        uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_carts_customer_id;
      DROP TABLE IF EXISTS carts;
    `);
  }
}
