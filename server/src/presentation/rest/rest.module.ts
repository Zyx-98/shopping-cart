import { Module } from '@nestjs/common';
import { RestAuthModule } from './auth/auth.module';
import { RestCartModule } from './cart/cart.module';
import { RestProductModule } from './product/product.module';
import { RestOrderModule } from './order/order.module';

@Module({
  imports: [RestAuthModule, RestCartModule, RestProductModule, RestOrderModule],
})
export class RestModule {}
