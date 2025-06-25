import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InitiatePaymentCommand } from './initiate-payment.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { PaymentInitiatedForOrderEvent } from '../../event/payment-initiated-for-order.event';

@CommandHandler(InitiatePaymentCommand)
export class InitiatePaymentHandler
  implements ICommandHandler<InitiatePaymentCommand>
{
  private readonly logger = new Logger(InitiatePaymentHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: InitiatePaymentCommand): Promise<any> {
    const { orderId } = command;

    await this.unitOfWork.execute(async () => {
      const { orderRepository, paymentRepository, sagaInstanceRepository } =
        this.unitOfWork;

      const order = await orderRepository.findById(orderId);

      if (!order) {
        throw new NotFoundException(
          `Order with ID ${orderId.toString()} not found`,
        );
      }

      const payment = PaymentAggregate.create(orderId, order.getTotalPrice());

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(
          `Saga with order Id ${orderId.toString()} not found`,
        );
      }

      const payload = {
        ...sagaInstance.payload,
        paymentId: payment.id.toValue(),
      };

      await paymentRepository.persist(payment);

      sagaInstance.advanceStep(
        OrderProcessingSagaStep.PAYMENT_CREATED,
        payload,
      );

      await sagaInstanceRepository.persist(sagaInstance);
    });

    this.logger.log(
      `Payment initiated successfully for order ID ${orderId.toString()}`,
    );

    this.eventBus.publish(new PaymentInitiatedForOrderEvent(orderId));
  }
}
