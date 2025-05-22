import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartItemsTable1743329110666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            cart_id UUID NOT NULL,
            product_id UUID NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_cart_items_cart_id;
        DROP INDEX IF EXISTS idx_cart_items_product_id;
        DROP TABLE IF EXISTS cart_items;
        `);
  }
}
