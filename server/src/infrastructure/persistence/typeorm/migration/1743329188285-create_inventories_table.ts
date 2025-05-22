import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoriesTable1743329188285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS inventories (
                uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                product_id UUID NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_inventories_product_id ON inventories(product_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_inventories_product_id;
            DROP TABLE IF EXISTS inventories;
        `);
  }
}
