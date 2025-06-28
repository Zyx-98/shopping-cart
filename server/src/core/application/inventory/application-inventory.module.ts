import { Module } from '@nestjs/common';
import { ReserveInventoryForOrderHandler } from './command/reserve-inventory-for-order/reserve-inventory-for-order.handler';
import { CompensateOrderInventoryHandler } from './command/compensate-order-inventory./compensate-order-inventory.handler';
import { GetInventoriesByProductIdsHandler } from './query/get-inventories-by-product-ids/get-inventories-by-product-ids.handler';

@Module({
  providers: [
    ReserveInventoryForOrderHandler,
    CompensateOrderInventoryHandler,
    GetInventoriesByProductIdsHandler,
  ],
  exports: [
    ReserveInventoryForOrderHandler,
    CompensateOrderInventoryHandler,
    GetInventoriesByProductIdsHandler,
  ],
})
export class ApplicationInventoryModule {}
