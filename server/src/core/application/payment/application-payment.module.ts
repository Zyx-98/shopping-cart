import { Module } from '@nestjs/common';
import { MakePaymentForCreatedOrderHandler } from './command/make-payment-for-created-order/make-payment-for-created-order.handler';
import { MarkAsPaidHandler } from './command/mark-as-paid/mark-as-paid.handler';
import { PayForOrderHandler } from './command/pay-for-order/pay-for-order.handler';
import { MarkAsFailedHandler } from './command/mark-as-fail/mark-as-failed.handler';
import { CancelPaymentForCanceledOrderHandler } from './command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.handler';

@Module({
  providers: [
    MakePaymentForCreatedOrderHandler,
    MarkAsPaidHandler,
    MarkAsFailedHandler,
    PayForOrderHandler,
    CancelPaymentForCanceledOrderHandler,
  ],
  exports: [
    MakePaymentForCreatedOrderHandler,
    MarkAsPaidHandler,
    MarkAsFailedHandler,
    PayForOrderHandler,
    CancelPaymentForCanceledOrderHandler,
  ],
})
export class ApplicationPaymentModule {}
