import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/remove-inventory/reserve-inventory-for-order.command';
import { MarkOrderAsFailCommand } from '../command/mark-as-fail/mark-order-as-fail.command';
import { InsufficientInventoryOnOrderCreatedEvent } from '../../inventory/event/insufficient-inventory-on-order-created.event';
import { InventoryCommittedCommand } from '../command/inventory-committed/inventory-committed.commad';
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
        return new MarkOrderAsFailCommand(event.orderId);
      }),
    );
  };

  @Saga()
  inventoryCommitted = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(InventoryReservedForCreatedOrderEvent),
      map((event) => {
        return new InventoryCommittedCommand(event.orderId);
      }),
    );
  };
}
