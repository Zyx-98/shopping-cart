import AppDataSource from 'data-source';
import { UserSchema } from '../typeorm/entities/user.schema';
import { BcryptHashingService } from 'src/infrastructure/auth/services/bcrypt-hashing.service';
import { CustomerSchema } from '../typeorm/entities/customer.schema';
import { randomUUID } from 'crypto';

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

    const userRepo = queryRunner.manager.getRepository(UserSchema);
    const customerRepo = queryRunner.manager.getRepository(CustomerSchema);

    const user = userRepo.create({
      uuid: randomUUID(),
      name: 'customer test',
      email: 'test@example.com',
      passwordHash: await new BcryptHashingService().hash('password123'),
    });

    const savedUser = await userRepo.save(user);

    const customer = customerRepo.create({
      uuid: randomUUID(),
      name: 'customer test',
      email: user.email,
      userId: savedUser.id,
      address: 'address test',
      phone: '000-000-0000',
    });

    await customerRepo.save(customer);

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
