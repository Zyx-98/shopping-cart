import { Module } from '@nestjs/common';
import { InitiatePaymentHandler } from './command/initiate-payment/initiate-payment.handler';
import { MarkAsPaidHandler } from './command/mark-as-paid/mark-as-paid.handler';
import { PayForOrderHandler } from './command/pay-for-order/pay-for-order.handler';
import { MarkAsFailedHandler } from './command/mark-as-failed/mark-as-failed.handler';
import { CancelPaymentForCanceledOrderHandler } from './command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.handler';

@Module({
  providers: [
    InitiatePaymentHandler,
    MarkAsPaidHandler,
    MarkAsFailedHandler,
    PayForOrderHandler,
    CancelPaymentForCanceledOrderHandler,
  ],
  exports: [
    InitiatePaymentHandler,
    MarkAsPaidHandler,
    MarkAsFailedHandler,
    PayForOrderHandler,
    CancelPaymentForCanceledOrderHandler,
  ],
})
export class ApplicationPaymentModule {}
