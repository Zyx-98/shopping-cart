import AppDataSource from 'data-source';
import { UserSchema } from '../entities/user.schema';
import {
  FactorizedAttrs,
  Factory,
  LazyInstanceAttribute,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { BcryptHashingService } from 'src/infrastructure/auth/services/bcrypt-hashing.service';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { CustomerFactory } from './customer.factory';

export class UserFactory extends Factory<UserSchema> {
  protected entity = UserSchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<UserSchema> {
    const name = faker.internet.displayName();
    const email = faker.internet.email();
    return {
      uuid: v4(),
      name,
      email,
      passwordHash: async () =>
        await new BcryptHashingService().hash('password123'),
      customer: new LazyInstanceAttribute(
        (instance) =>
          new SingleSubfactory(CustomerFactory, {
            name,
            email,
            user: instance,
          }),
      ),
    };
  }
}
