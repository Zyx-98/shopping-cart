import { Module } from '@nestjs/common';
import { CartController } from './controller/cart.controller';
@Module({
  controllers: [CartController],
})
export class RestCartModule {}
