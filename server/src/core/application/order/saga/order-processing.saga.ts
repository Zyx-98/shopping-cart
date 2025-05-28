import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { map, mergeMap, Observable } from 'rxjs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/reserve-inventory-for-order/reserve-inventory-for-order.command';
import { MarkOrderFailCommand } from '../command/mark-order-fail/mark-order-fail.command';
import { OrderInventoryReservationFailedEvent } from '../../inventory/event/order-inventory-reservation-failed.event';
import { MarkOrderAwaitingPaymentCommand } from '../command/mark-order-awaiting-payment/mark-order-awaiting-payment.command';
import { OrderInventoryReservedEvent } from '../../inventory/event/order-inventory-reserved.event';
import { CompensateOrderInventoryCommand } from '../../inventory/command/compensate-order-inventory./compensate-order-inventory.command';
import { OrderCanceledEvent } from 'src/core/domain/order/event/order-canceled.event';
import { PaymentFailedEvent } from 'src/core/domain/payment/event/payment-failed.event';
import { InitiatePaymentCommand } from '../../payment/command/initiate-payment/initiate-payment.command';
import { CancelOrderCommand } from '../command/cancel-order/cancel-order.command';
import { PaymentPaidEvent } from 'src/core/domain/payment/event/payment-paid.event';
import { MarkOrderAsCompleteCommand } from '../command/mark-order-as-complete/mark-order-as-complete.command';
import { CancelPaymentForCanceledOrderCommand } from '../../payment/command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.command';

@Injectable()
export class OrderProcessingSaga {
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      mergeMap((event) => [
        new ReserveInventoryForOrderCommand(event.orderId, event.orderLines),
        new InitiatePaymentCommand(event.orderId, event.totalAmount),
      ]),
    );
  };

  @Saga()
  handleOrderInventoryReservationFailure = (
    events$: Observable<any>,
  ): Observable<any> => {
    return events$.pipe(
      ofType(OrderInventoryReservationFailedEvent),
      map((event) => {
        return new MarkOrderFailCommand(event.orderId);
      }),
    );
  };

  @Saga()
  handleOrderInventoryReserved = (
    events$: Observable<any>,
  ): Observable<any> => {
    return events$.pipe(
      ofType(OrderInventoryReservedEvent),
      map((event) => {
        return new MarkOrderAwaitingPaymentCommand(event.orderId);
      }),
    );
  };

  @Saga()
  orderCanceled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCanceledEvent),
      mergeMap((event) => {
        return [
          new CompensateOrderInventoryCommand(event.orderLines),
          ...(event.paymentId
            ? [new CancelPaymentForCanceledOrderCommand(event.orderId)]
            : []),
        ];
      }),
    );
  };

  @Saga()
  paymentFailed = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(PaymentFailedEvent),
      map((event) => {
        return new CancelOrderCommand(event.orderId);
      }),
    );
  };

  @Saga()
  paymentPaid = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(PaymentPaidEvent),
      map((event) => new MarkOrderAsCompleteCommand(event.orderId)),
    );
  };
}
