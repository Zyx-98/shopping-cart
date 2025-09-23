import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponsTable1743329110667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        reduction int NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
      CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_coupons_code;
      DROP INDEX IF EXISTS idx_coupons_type;
      DROP TABLE IF EXISTS coupons;
    `);
  }
}
