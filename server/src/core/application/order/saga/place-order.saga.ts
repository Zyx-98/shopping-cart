import { Injectable } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { map, Observable } from 'rxjs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { RemoveInventoryForCreatedOrderCommand } from '../../inventory/command/remove-inventory/remove-inventory-for-created-order.command';
import { MarkOrderAsFailCommand } from '../command/mark-as-fail/mark-order-as-fail.command';
import { InsufficientInventoryAvailableForCreatedOrderEvent } from '../../inventory/event/insufficient-inventory-available-for-created-order.event';
import { InventoryCommittedCommand } from '../command/inventory-committed/inventory-committed.commad';

@Injectable()
export class PlaceOrderSaga {
  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event) => {
        console.log('🚀 ~ PlaceOrderSaga ~ map ~ event:', event);
        return new RemoveInventoryForCreatedOrderCommand(
          event.orderId,
          event.orderLines,
        );
      }),
    );
  };

  @Saga()
  insufficientInventory = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(InsufficientInventoryAvailableForCreatedOrderEvent),
      map((event) => {
        return new MarkOrderAsFailCommand(event.orderId);
      }),
    );
  };

  @Saga()
  inventoryCommitted = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(InventoryCommittedCommand),
      map((event) => {
        return new InventoryCommittedCommand(event.orderId);
      }),
    );
  };
}
