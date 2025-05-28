import { Module } from '@nestjs/common';
import { ReserveInventoryForOrderHandler } from './command/reserve-inventory-for-order/reserve-inventory-for-order.handler';
import { CompensateOrderInventoryHandler } from './command/compensate-order-inventory./compensate-order-inventory.handler';

@Module({
  providers: [ReserveInventoryForOrderHandler, CompensateOrderInventoryHandler],
  exports: [ReserveInventoryForOrderHandler, CompensateOrderInventoryHandler],
})
export class ApplicationInventoryModule {}
