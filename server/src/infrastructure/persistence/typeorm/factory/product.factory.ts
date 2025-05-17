import {
  FactorizedAttrs,
  Factory,
  LazyInstanceAttribute,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { ProductSchema } from '../entities/product.schema';
import AppDataSource from 'data-source';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { InventoryFactory } from './inventory.factory';

export class ProductFactory extends Factory<ProductSchema> {
  protected entity = ProductSchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<ProductSchema> {
    return {
      uuid: randomUUID(),
      name: faker.commerce.productName(),
      itemPrice: faker.number.int({ min: 1000, max: 800000 }),
      inventory: new LazyInstanceAttribute(
        (instance) =>
          new SingleSubfactory(InventoryFactory, { product: instance }),
      ),
    };
  }
}
