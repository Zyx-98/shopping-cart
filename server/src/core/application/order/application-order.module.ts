import { Module } from '@nestjs/common';
import { GetOrderDetailHandler } from './query/get-order-detail/get-order-detail.handler';
import { PlaceOrderHandler } from './command/place-order/place-order.handler';
import { MarkOrderFailHandler } from './command/mark-order-fail/mark-order-fail.handler';
import { MarkOrderAwaitingPaymentHandler } from './command/mark-order-awaiting-payment/mark-order-awaiting-payment.handler';
import { CancelOrderHandler } from './command/cancel-order/cancel-order.handler';
import { OrderMapper } from './mapper/order.mapper';
import { MarkOrderAsCompleteHandler } from './command/mark-order-as-complete/mark-order-as-complete.handler';

@Module({
  providers: [
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderFailHandler,
    MarkOrderAwaitingPaymentHandler,
    CancelOrderHandler,
    MarkOrderAsCompleteHandler,
    OrderMapper,
  ],
  exports: [
    GetOrderDetailHandler,
    PlaceOrderHandler,
    MarkOrderFailHandler,
    MarkOrderAwaitingPaymentHandler,
    CancelOrderHandler,
    MarkOrderAsCompleteHandler,
    OrderMapper,
  ],
})
export class ApplicationOrderModule {}
