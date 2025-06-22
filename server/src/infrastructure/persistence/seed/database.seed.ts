import AppDataSource from 'data-source';
import { UserSchema } from '../typeorm/entities/user.schema';
import { UserFactory } from '../typeorm/factory/user.factory';
import { ProductSchema } from '../typeorm/entities/product.schema';
import { ProductFactory } from '../typeorm/factory/product.factory';
import { QueryRunner } from 'typeorm';

async function seed() {
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await truncateAllTables(queryRunner);

    await queryRunner.query(`truncate table products restart identity cascade`);

    const user = await new UserFactory().make({
      email: 'test@example.com',
      name: 'customer test',
    });

    const userRepo = queryRunner.manager.getRepository(UserSchema);

    await userRepo.save(user);

    const productRepo = queryRunner.manager.getRepository(ProductSchema);

    const products = await new ProductFactory().makeMany(100);

    await productRepo.save(products);

    await queryRunner.commitTransaction();

    console.log('🌱 Seeding completed successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log('❌ Error during seeding:', error);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

async function truncateAllTables(queryRunner: QueryRunner) {
  // Get all table names from the current schema
  const tables = await queryRunner.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `);

  const tableNames = tables.map((row) => `"${row.tablename}"`).join(', ');

  await queryRunner.query('SET session_replication_role = replica;');

  await queryRunner.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
  );

  await queryRunner.query('SET session_replication_role = DEFAULT;');
}

seed();
