import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { OrderCreatedEvent } from 'src/core/domain/order/event/order-created.event';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import {
  ISagaInstanceRepository,
  SAGA_INSTANCE_REPOSITORY,
} from 'src/core/domain/saga/repository/saga-instance.repository';
import { OrderInventoryReservedEvent } from '../../inventory/event/order-inventory-reserved.event';
import { ReserveInventoryForOrderCommand } from '../../inventory/command/reserve-inventory-for-order/reserve-inventory-for-order.command';
import { MarkOrderAwaitingPaymentCommand } from '../../order/command/mark-order-awaiting-payment/mark-order-awaiting-payment.command';
import { OrderCanceledEvent } from 'src/core/domain/order/event/order-canceled.event';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';
import { CancelPaymentForCanceledOrderCommand } from '../../payment/command/cancel-payment-for-canceled-order/cancel-payment-for-canceled-order.command';
import { CancelOrderCommand } from '../../order/command/cancel-order/cancel-order.command';
import { MarkOrderAsCompleteCommand } from '../../order/command/mark-order-as-complete/mark-order-as-complete.command';

@Injectable()
export class OrderProcessingRecover implements OnApplicationBootstrap {
  private readonly logger = new Logger(OrderProcessingRecover.name);

  constructor(
    @Inject(SAGA_INSTANCE_REPOSITORY)
    private readonly sagaInstanceRepository: ISagaInstanceRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log(
      'Starting saga recovery process for active PLACE_ORDER sagas',
    );

    const activeSagas = await this.sagaInstanceRepository.findActiveSagaByType(
      SagaType.PLACE_ORDER,
    );

    for (const activeSaga of activeSagas) {
      const order = await this.orderRepository.findById(
        OrderId.create(activeSaga.payload.orderId),
      );

      if (!order) {
        this.logger.error(
          `Order with id ${activeSaga.payload.orderId} not found`,
        );
        continue;
      }

      const payment = await this.paymentRepository.findByOrderId(order.id);

      switch (activeSaga.currentStep) {
        case OrderProcessingSagaStep.INITIATED: {
          this.eventBus.publish(
            new OrderCreatedEvent(
              order.id,
              order.customerId,
              order.orderLines,
              order.getTotalPrice(),
            ),
          );

          break;
        }

        case OrderProcessingSagaStep.PAYMENT_CREATED: {
          await this.commandBus.execute(
            new ReserveInventoryForOrderCommand(order.id, order.orderLines),
          );

          break;
        }

        case OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED: {
          this.eventBus.publish(
            new OrderInventoryReservedEvent(
              OrderId.create(activeSaga.payload.orderId),
            ),
          );
          break;
        }

        case OrderProcessingSagaStep.INVENTORY_RESERVED: {
          await this.commandBus.execute(
            new MarkOrderAwaitingPaymentCommand(order.id),
          );

          break;
        }

        case OrderProcessingSagaStep.ORDER_CANCELED: {
          await this.eventBus.publish(
            new OrderCanceledEvent(order.id, order.orderLines, payment?.id),
          );

          break;
        }

        case OrderProcessingSagaStep.INVENTORY_COMPENSATED: {
          if (payment) {
            await this.commandBus.execute(
              new CancelPaymentForCanceledOrderCommand(order.id),
            );
          }

          break;
        }

        case OrderProcessingSagaStep.PAYMENT_FAILED: {
          await this.commandBus.execute(new CancelOrderCommand(order.id));

          break;
        }

        case OrderProcessingSagaStep.PAYMENT_SUCCEEDED: {
          await this.commandBus.execute(
            new MarkOrderAsCompleteCommand(order.id),
          );

          break;
        }

        default:
          break;
      }
    }

    this.logger.log(
      'Saga recovery process completed for all active PLACE_ORDER sagas',
    );
  }
}
