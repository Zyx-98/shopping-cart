import { Global, Module } from '@nestjs/common';
import { ApplicationProductModule } from './product/application-product.module';
import { ApplicationOrderModule } from './order/application-order.module';
import { ApplicationInventoryModule } from './inventory/application-inventory.module';
import { ApplicationCartModule } from './cart/application-cart.module';
import { ApplicationAuthModule } from './auth/application-auth.module';
import { ApplicationPaymentModule } from './payment/application-payment.module';
import { ApplicationSagaModule } from './saga/application-saga.module';

@Global()
@Module({
  imports: [
    ApplicationProductModule,
    ApplicationOrderModule,
    ApplicationInventoryModule,
    ApplicationCartModule,
    ApplicationAuthModule,
    ApplicationPaymentModule,
    ApplicationSagaModule,
  ],
  exports: [
    ApplicationProductModule,
    ApplicationOrderModule,
    ApplicationInventoryModule,
    ApplicationCartModule,
    ApplicationAuthModule,
    ApplicationPaymentModule,
    ApplicationSagaModule,
  ],
})
export class ApplicationModule {}
