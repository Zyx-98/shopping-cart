import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderLinesTable1743329155857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS order_lines (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL,
            product_id UUID NOT NULL,
            description text NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            price_at_time_of_order NUMERIC(10, 2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines(order_id);
        CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON order_lines(product_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_order_lines_order_id;
        DROP INDEX IF EXISTS idx_order_lines_product_id;
        DROP TABLE IF EXISTS order_lines;
        `);
  }
}
