import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { concatMap, EMPTY, map, Observable, of } from 'rxjs';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/reserve-inventory-for-order/reserve-inventory-for-order.command';
import { InitiatePaymentCommand } from '../../payment/command/initiate-payment/initiate-payment.command';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { OrderInventoryReservationFailedEvent } from '../../inventory/event/order-inventory-reservation-failed.event';
import { MarkOrderFailCommand } from '../../order/command/mark-order-fail/mark-order-fail.command';
import { OrderInventoryReservedEvent } from '../../inventory/event/order-inventory-reserved.event';
import { MarkOrderAwaitingPaymentCommand } from '../../order/command/mark-order-awaiting-payment/mark-order-awaiting-payment.command';
import { OrderCanceledEvent } from 'src/core/domain/order/event/order-canceled.event';
import { CompensateOrderInventoryCommand } from '../../inventory/command/compensate-order-inventory./compensate-order-inventory.command';
import { CancelPaymentForCanceledOrderCommand } from '../../payment/command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.command';
import { PaymentFailedEvent } from 'src/core/domain/payment/event/payment-failed.event';
import { CancelOrderCommand } from '../../order/command/cancel-order/cancel-order.command';
import { PaymentPaidEvent } from 'src/core/domain/payment/event/payment-paid.event';
import { MarkOrderAsCompleteCommand } from '../../order/command/mark-order-as-complete/mark-order-as-complete.command';

@Injectable()
export class OrderProcessingOrchestrator {
  private readonly logger = new Logger(OrderProcessingOrchestrator.name);

  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      concatMap((event) => {
        this.logger.log(
          `Processing payment for order ID: ${event.orderId.toString()}`,
        );
        return of(
          new InitiatePaymentCommand(event.orderId, event.totalAmount),
        ).pipe(
          concatMap(() => {
            this.logger.log(
              `Reserving inventory for order ID: ${event.orderId.toString()}`,
            );
            return of(
              new ReserveInventoryForOrderCommand(
                event.orderId,
                event.orderLines,
              ),
            );
          }),
        );
      }),
    );
  };

  @Saga()
  handleOrderInventoryReservationFailure = (
    events$: Observable<any>,
  ): Observable<any> => {
    return events$.pipe(
      ofType(OrderInventoryReservationFailedEvent),
      map((event) => {
        this.logger.log(
          `Handling inventory reservation failure for order ID: ${event.orderId.toString()}`,
        );
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
        this.logger.log(
          `Handling inventory reserved event for order ID: ${event.orderId.toString()}`,
        );

        return new MarkOrderAwaitingPaymentCommand(event.orderId);
      }),
    );
  };

  @Saga()
  orderCanceled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCanceledEvent),
      concatMap((event) => {
        return of(
          new CompensateOrderInventoryCommand(event.orderId, event.orderLines),
        ).pipe(
          concatMap(() => {
            if (event.paymentId) {
              this.logger.log(
                `Compensating inventory for canceled order ID: ${event.orderId.toString()}`,
              );
              return of(
                new CancelPaymentForCanceledOrderCommand(event.orderId),
              );
            } else {
              return EMPTY;
            }
          }),
        );
      }),
    );
  };

  @Saga()
  paymentFailed = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(PaymentFailedEvent),
      map((event) => {
        this.logger.log(
          `Handling payment failure for order ID: ${event.orderId.toString()}`,
        );

        return new CancelOrderCommand(event.orderId);
      }),
    );
  };

  @Saga()
  paymentPaid = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(PaymentPaidEvent),
      map((event) => {
        this.logger.log(
          `Handling payment success for order ID: ${event.orderId.toString()}`,
        );

        new MarkOrderAsCompleteCommand(event.orderId);
      }),
    );
  };
}
