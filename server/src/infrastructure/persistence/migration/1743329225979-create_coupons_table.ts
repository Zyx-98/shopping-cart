import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponsTable1743329225979 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        uuid UUID NOT NULL UNIQUE,
        code VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        reduction int NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS coupons;
    `);
  }
}
