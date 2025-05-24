import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { map, mergeMap, Observable } from 'rxjs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/remove-inventory/reserve-inventory-for-order.command';
import { MarkOrderFailCommand } from '../command/mark-order-fail/mark-order-fail.command';
import { InsufficientInventoryOnOrderCreatedEvent } from '../../inventory/event/insufficient-inventory-on-order-created.event';
import { MarkOrderAwaitingPaymentCommand } from '../command/mark-order-awaiting-payment/mark-order-awaiting-payment.command';
import { InventoryReservedForCreatedOrderEvent } from '../../inventory/event/inventory-reserved-for-created-order.event';
import { RestoreInventoryCommand } from '../../inventory/command/add-inventory/restore-inventory.command';
import { OrderCanceledEvent } from 'src/core/domain/order/event/order-canceled.event';
import { PaymentFailedEvent } from 'src/core/domain/payment/event/payment-failed.event';
import { MakePaymentForCreatedOrderCommand } from '../../payment/command/make-payment-for-created-order/make-payment-for-created-order.command';
import { CancelOrderCommand } from '../command/cancel-order/cancel-order.command';
import { PaymentPaidEvent } from 'src/core/domain/payment/event/payment-paid.event';
import { MarkOrderAsCompleteCommand } from '../command/mark-order-as-complete/mark-order-as-complete.command';

@Injectable()
export class OrderProcessingSaga {
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      mergeMap((event) => [
        new ReserveInventoryForOrderCommand(event.orderId, event.orderLines),
        new MakePaymentForCreatedOrderCommand(event.orderId, event.totalAmount),
      ]),
    );
  };

  @Saga()
  insufficientInventory = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(InsufficientInventoryOnOrderCreatedEvent),
      map((event) => {
        return new MarkOrderFailCommand(event.orderId);
      }),
    );
  };

  @Saga()
  inventoryCommitted = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(InventoryReservedForCreatedOrderEvent),
      map((event) => {
        return new MarkOrderAwaitingPaymentCommand(event.orderId);
      }),
    );
  };

  @Saga()
  orderCanceled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCanceledEvent),
      map((event) => {
        return new RestoreInventoryCommand(event.orderLines);
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
