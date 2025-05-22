import { Global, Module } from '@nestjs/common';
import { ApplicationProductModule } from './product/application-product.module';
import { ApplicationOrderModule } from './order/application-order.module';
import { ApplicationInventoryModule } from './inventory/application-inventory.module';
import { ApplicationCartModule } from './cart/application-cart.module';
import { ApplicationAuthModule } from './auth/application-auth.module';

@Global()
@Module({
  imports: [
    ApplicationProductModule,
    ApplicationOrderModule,
    ApplicationInventoryModule,
    ApplicationCartModule,
    ApplicationAuthModule,
  ],
  exports: [
    ApplicationProductModule,
    ApplicationOrderModule,
    ApplicationInventoryModule,
    ApplicationCartModule,
    ApplicationAuthModule,
  ],
})
export class ApplicationModule {}
