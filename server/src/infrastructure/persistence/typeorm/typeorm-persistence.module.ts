import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from 'src/core/domain/user/repository/user.repository';
import { UserRepository } from './repositories/user.repository';
import { UserSchema } from './entities/user.schema';
import { PersistenceUserMapper } from './mappers/persistence-user.mapper';
import { typeOrmAsyncConfig } from './typeorm.config';
import { PersistenceCustomerMapper } from './mappers/persistence-customer.mapper';
import { CUSTOMER_REPOSITORY } from 'src/core/domain/customer/repository/customer.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerSchema } from './entities/customer.schema';
import { PersistenceProductMapper } from './mappers/persistence-product.mapper';
import { PersistenceCartMapper } from './mappers/persistence-cart.mapper';
import { CART_REPOSITORY } from 'src/core/domain/cart/repository/cart.repository';
import { CartRepository } from './repositories/cart.repository';
import { PRODUCT_REPOSITORY } from 'src/core/domain/product/repository/product.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductSchema } from './entities/product.schema';
import { CartSchema } from './entities/cart.schema';
import { CartItemSchema } from './entities/cart-item.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      CustomerSchema,
      ProductSchema,
      CartSchema,
      CartItemSchema,
    ]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
  ],
  providers: [
    PersistenceUserMapper,
    PersistenceCustomerMapper,
    PersistenceProductMapper,
    PersistenceCartMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
  ],
  exports: [
    USER_REPOSITORY,
    CUSTOMER_REPOSITORY,
    PRODUCT_REPOSITORY,
    CART_REPOSITORY,
  ],
})
export class TypeormPersistenceModule {}
