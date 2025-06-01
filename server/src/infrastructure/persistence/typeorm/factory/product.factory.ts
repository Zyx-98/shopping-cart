import {
  FactorizedAttrs,
  Factory,
  LazyInstanceAttribute,
  SingleSubfactory,
} from '@jorgebodega/typeorm-factory';
import { ProductSchema } from '../entities/product.schema';
import AppDataSource from 'data-source';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { InventoryFactory } from './inventory.factory';

export class ProductFactory extends Factory<ProductSchema> {
  protected entity = ProductSchema;
  protected dataSource = AppDataSource;

  protected attrs(): FactorizedAttrs<ProductSchema> {
    return {
      uuid: v4(),
      name: faker.commerce.productName(),
      price: faker.number.int({ min: 1000, max: 800000 }),
      inventory: new LazyInstanceAttribute(
        (instance) =>
          new SingleSubfactory(InventoryFactory, { product: instance }),
      ),
    };
  }
}
