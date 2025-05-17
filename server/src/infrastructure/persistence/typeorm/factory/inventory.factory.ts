import {
  EagerInstanceAttribute,
  FactorizedAttrs,
  Factory,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { InventorySchema } from '../entities/inventory.schema';
import AppDataSource from 'data-source';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { ProductFactory } from './product.factory';

export class InventoryFactory extends Factory<InventorySchema> {
  protected entity = InventorySchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<InventorySchema> {
    return {
      uuid: randomUUID(),
      quantity: faker.number.int({ min: 2, max: 100 }),
      product: new EagerInstanceAttribute(
        (instance) =>
          new SingleSubfactory(ProductFactory, { inventory: instance }),
      ),
    };
  }
}
