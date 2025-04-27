import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderLinesTable1743329155857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS order_lines (
            id SERIAL PRIMARY KEY,
            uuid UUID NOT NULL UNIQUE,
            order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            description text NOT NULL,
            quantity INT NOT NULL DEFAULT 1
        );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS order_lines;
        `);
  }
}
