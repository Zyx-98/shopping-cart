import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartsTable1743329095907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        uuid UUID NOT NULL UNIQUE,
        customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS carts;
    `);
  }
}
