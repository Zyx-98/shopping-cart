import { Module } from '@nestjs/common';
import { ReserveInventoryForOrderHandler } from './command/remove-inventory/reserve-inventory-for-order.handler';
import { RestoreInventoryHandler } from './command/add-inventory/restore-inventory.handler';

@Module({
  providers: [ReserveInventoryForOrderHandler, RestoreInventoryHandler],
  exports: [ReserveInventoryForOrderHandler, RestoreInventoryHandler],
})
export class ApplicationInventoryModule {}
