import { Module } from '@nestjs/common';
import { PlaceOrderSaga } from './saga/place-order.saga';
import { GetOrderDetailHandler } from './query/get-order-detail/get-order-detail.handler';
import { PlaceOrderHandler } from './command/place-order/place-order.handler';
import { MarkOrderFailHandler } from './command/mark-order-fail/mark-order-fail.handler';
import { MarkOrderAwaitingPaymentHandler } from './command/mark-order-awaiting-payment/mark-order-awaiting-payment.handler';
import { CancelOrderHandler } from './command/cancel-order/cancel-order.handler';
import { OrderMapper } from './mapper/order.mapper';

@Module({
  providers: [
    PlaceOrderSaga,
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderFailHandler,
    MarkOrderAwaitingPaymentHandler,
    CancelOrderHandler,
    OrderMapper,
  ],
  exports: [
    PlaceOrderSaga,
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderFailHandler,
    MarkOrderAwaitingPaymentHandler,
    CancelOrderHandler,
    OrderMapper,
  ],
})
export class ApplicationOrderModule {}
