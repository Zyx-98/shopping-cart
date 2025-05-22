import { Module } from '@nestjs/common';
import { RemoveInventoryForCreatedOrderHandler } from './command/remove-inventory/remove-inventory-for-created-order.handler';

@Module({
  providers: [RemoveInventoryForCreatedOrderHandler],
  exports: [RemoveInventoryForCreatedOrderHandler],
})
export class ApplicationInventoryModule {}
