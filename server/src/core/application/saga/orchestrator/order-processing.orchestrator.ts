import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { concatMap, map, Observable, of } from 'rxjs';
import { InitiatePaymentCommand } from '../../payment/command/initiate-payment/initiate-payment.command';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import { OrderInventoryReservationFailedEvent } from '../../inventory/event/order-inventory-reservation-failed.event';
import { MarkOrderFailCommand } from '../../order/command/mark-order-fail/mark-order-fail.command';
import { OrderInventoryReservedEvent } from '../../inventory/event/order-inventory-reserved.event';
import { MarkOrderAwaitingPaymentCommand } from '../../order/command/mark-order-awaiting-payment/mark-order-awaiting-payment.command';
import { OrderCanceledEvent } from 'src/core/domain/order/event/order-canceled.event';
import { CancelPaymentForCanceledOrderCommand } from '../../payment/command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.command';
import { PaymentFailedEvent } from 'src/core/domain/payment/event/payment-failed.event';
import { CancelOrderCommand } from '../../order/command/cancel-order/cancel-order.command';
import { PaymentPaidEvent } from 'src/core/domain/payment/event/payment-paid.event';
import { MarkOrderAsCompleteCommand } from '../../order/command/mark-order-as-complete/mark-order-as-complete.command';
import { PaymentInitiatedForOrderEvent } from '../../payment/event/payment-initiated-for-order.event';
import { CompensatedInventoryForOrderEvent } from '../../inventory/event/compensated-inventory-for-order.event';
import { ProductReservationSucceededForOrderEvent } from '../../inventory/event/product-reservation-succeeded-for-order.event';
import { ReleasedProductReservationForOrderEvent } from '../../inventory/event/released-product-reservation-for-order.event';
import { ReservedInventoryForOrderV2Command } from '../../inventory/command/reserve-inventory-for-order-v2/reserve-inventory-for-order-v2.command';
import { ReleaseProductReservationForOrderCommand } from '../../inventory/command/release-product-reservation-for-order/release-product-reservation-for-order.command';
import { CompensateOrderInventoryCommand } from '../../inventory/command/compensate-order-inventory./compensate-order-inventory.command';

@Injectable()
export class OrderProcessingOrchestrator {
  private readonly logger = new Logger(OrderProcessingOrchestrator.name);

  @Saga()
  orderCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event) => {
        return new ReservedInventoryForOrderV2Command(
          event.orderId,
          event.orderLines[0],
        );
      }),
    );
  };

  @Saga()
  productReserved = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ProductReservationSucceededForOrderEvent),
      map((event) => {
        const { orderId, nextOrderLine } = event;

        return new ReservedInventoryForOrderV2Command(orderId, nextOrderLine);
      }),
    );
  };

  @Saga()
  inventoryReserved = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderInventoryReservedEvent),
      concatMap((event) => {
        this.logger.log(
          `Initiating payment for order ID: ${event.orderId.toString()}`,
        );
        return of(new InitiatePaymentCommand(event.orderId));
      }),
    );
  };

  @Saga()
  paymentInitiated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(PaymentInitiatedForOrderEvent),
      map((event) => {
        this.logger.log(
          `Handling inventory reserved event for order ID: ${event.orderId.toString()}`,
        );

        return new MarkOrderAwaitingPaymentCommand(event.orderId);
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
        return new ReleaseProductReservationForOrderCommand(event.orderId);
      }),
    );
  };

  @Saga()
  releasedProductReservation = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ReleasedProductReservationForOrderEvent),
      map((event) => {
        return new MarkOrderFailCommand(event.orderId);
      }),
    );
  };

  @Saga()
  orderCanceled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OrderCanceledEvent),
      map((event) => {
        return new CompensateOrderInventoryCommand(
          event.orderId,
          event.orderLines,
        );
      }),
    );
  };

  @Saga()
  compensatedInventoryForOrder = (
    events$: Observable<any>,
  ): Observable<any> => {
    return events$.pipe(
      ofType(CompensatedInventoryForOrderEvent),
      map((event) => {
        return new CancelPaymentForCanceledOrderCommand(event.orderId);
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

        return new MarkOrderAsCompleteCommand(event.orderId);
      }),
    );
  };
}
