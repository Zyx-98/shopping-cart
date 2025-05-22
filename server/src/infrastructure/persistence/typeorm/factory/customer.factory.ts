import {
  EagerInstanceAttribute,
  FactorizedAttrs,
  Factory,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { CustomerSchema } from '../entities/customer.schema';
import AppDataSource from 'data-source';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { UserFactory } from './user.factory';

export class CustomerFactory extends Factory<CustomerSchema> {
  protected entity = CustomerSchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<CustomerSchema> {
    return {
      name: faker.internet.displayName(),
      uuid: randomUUID(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number({ style: 'human' }),
      user: new EagerInstanceAttribute(
        (instance) => new SingleSubfactory(UserFactory, { customer: instance }),
      ),
    };
  }
}
