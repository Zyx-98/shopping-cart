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
import { TypeormQueryBuilderModule } from './query-builder/query-builder.module';
import { InventorySchema } from './entities/inventory.schema';
import { PersistenceInventoryMapper } from './mappers/persistence-inventory.mapper';
import { INVENTORY_REPOSITORY } from 'src/core/domain/inventory/repository/inventory.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { PaymentSchema } from './entities/payment.schema';
import { CouponSchema } from './entities/coupon.schema';
import { PersistenceOrderMapper } from './mappers/persistence-order.mapper';
import { ORDER_REPOSITORY } from 'src/core/domain/order/repository/order.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderSchema } from './entities/order.schema';
import { OrderLineSchema } from './entities/order-line.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      CustomerSchema,
      ProductSchema,
      CartSchema,
      CartItemSchema,
      InventorySchema,
      PaymentSchema,
      CouponSchema,
      OrderSchema,
      OrderLineSchema,
    ]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeormQueryBuilderModule,
  ],
  providers: [
    PersistenceUserMapper,
    PersistenceCustomerMapper,
    PersistenceProductMapper,
    PersistenceCartMapper,
    PersistenceInventoryMapper,
    PersistenceOrderMapper,
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
    {
      provide: INVENTORY_REPOSITORY,
      useClass: InventoryRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
  exports: [
    USER_REPOSITORY,
    CUSTOMER_REPOSITORY,
    PRODUCT_REPOSITORY,
    CART_REPOSITORY,
    INVENTORY_REPOSITORY,
    ORDER_REPOSITORY,
    TypeormQueryBuilderModule,
  ],
})
export class TypeormPersistenceModule {}
