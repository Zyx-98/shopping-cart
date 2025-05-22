import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/remove-inventory/reserve-inventory-for-order.command';
import { MarkOrderFailCommand } from '../command/mark-order-fail/mark-order-fail.command';
import { InsufficientInventoryOnOrderCreatedEvent } from '../../inventory/event/insufficient-inventory-on-order-created.event';
import { MarkOrderAwaitingPaymentCommand } from '../command/mark-order-awaiting-payment/mark-order-awaiting-payment.commad';
import { InventoryReservedForCreatedOrderEvent } from '../../inventory/event/inventory-reserved-for-created-order.event';

@Injectable()
export class PlaceOrderSaga {
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event) => {
        return new ReserveInventoryForOrderCommand(
          event.orderId,
          event.orderLines,
        );
      }),
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
}
