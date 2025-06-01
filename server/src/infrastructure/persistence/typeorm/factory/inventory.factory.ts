import {
  EagerInstanceAttribute,
  FactorizedAttrs,
  Factory,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { InventorySchema } from '../entities/inventory.schema';
import AppDataSource from 'data-source';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { ProductFactory } from './product.factory';

export class InventoryFactory extends Factory<InventorySchema> {
  protected entity = InventorySchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<InventorySchema> {
    return {
      uuid: v4(),
      stock: faker.number.int({ min: 100, max: 10000 }),
      product: new EagerInstanceAttribute(
        (instance) =>
          new SingleSubfactory(ProductFactory, { inventory: instance }),
      ),
    };
  }
}
