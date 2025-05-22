import { Module } from '@nestjs/common';
import { PlaceOrderSaga } from './saga/place-order.saga';
import { GetOrderDetailHandler } from './query/get-order-detail/get-order-detail.handler';
import { PlaceOrderHandler } from './command/place-order/place-order.handler';
import { MarkOrderAsFailHandler } from './command/mark-as-fail/mark-order-as-fail.handler';
import { InventoryCommittedHandler } from './command/inventory-committed/inventory-committed.handler';

@Module({
  providers: [
    PlaceOrderSaga,
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderAsFailHandler,
    InventoryCommittedHandler,
  ],
  exports: [
    PlaceOrderSaga,
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderAsFailHandler,
    InventoryCommittedHandler,
  ],
})
export class ApplicationOrderModule {}
