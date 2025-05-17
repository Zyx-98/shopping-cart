import AppDataSource from 'data-source';
import { UserSchema } from '../typeorm/entities/user.schema';
import { UserFactory } from '../typeorm/factory/user.factory';
import { ProductSchema } from '../typeorm/entities/product.schema';
import { ProductFactory } from '../typeorm/factory/product.factory';

async function seed() {
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.query(
      `truncate table customers restart identity cascade`,
    );
    await queryRunner.query(`truncate table users restart identity cascade`);
    await queryRunner.query(
      `truncate table inventories restart identity cascade`,
    );
    await queryRunner.query(`truncate table products restart identity cascade`);

    const user = await new UserFactory().make({
      email: 'test@example.com',
      name: 'customer test',
    });

    const userRepo = queryRunner.manager.getRepository(UserSchema);

    await userRepo.save(user);

    const productRepo = queryRunner.manager.getRepository(ProductSchema);

    const products = await new ProductFactory().makeMany(60);

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

seed();
