import { Module } from '@nestjs/common';
import { ReserveInventoryForOrderHandler } from './command/reserve-inventory-for-order/reserve-inventory-for-order.handler';
import { CompensateOrderInventoryHandler } from './command/compensate-order-inventory./compensate-order-inventory.handler';
import { GetInventoriesByProductIdsHandler } from './query/get-inventories-by-product-ids/get-inventories-by-product-ids.handler';
import { ReservedInventoryForOrderV2Handler } from './command/reserve-inventory-for-order-v2/reserve-inventory-for-order-v2.handle';

@Module({
  providers: [
    ReserveInventoryForOrderHandler,
    CompensateOrderInventoryHandler,
    GetInventoriesByProductIdsHandler,
    ReservedInventoryForOrderV2Handler,
  ],
  exports: [
    ReserveInventoryForOrderHandler,
    CompensateOrderInventoryHandler,
    GetInventoriesByProductIdsHandler,
    ReservedInventoryForOrderV2Handler,
  ],
})
export class ApplicationInventoryModule {}
