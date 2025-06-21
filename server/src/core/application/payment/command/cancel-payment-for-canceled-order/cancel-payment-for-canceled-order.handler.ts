import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentForCanceledOrderCommand } from './cancel-payment-for-canceled-order.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(CancelPaymentForCanceledOrderCommand)
export class CancelPaymentForCanceledOrderHandler
  implements ICommandHandler<CancelPaymentForCanceledOrderCommand>
{
  private readonly logger = new Logger(
    CancelPaymentForCanceledOrderHandler.name,
  );

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CancelPaymentForCanceledOrderCommand): Promise<void> {
    const { orderId } = command;

    await this.unitOfWork.execute(async () => {
      const { paymentRepository, sagaInstanceRepository } = this.unitOfWork;

      const payment = await paymentRepository.findByOrderId(orderId);

      if (!payment) {
        throw new Error(`Payment with OrderId ${orderId.toValue()} not found`);
      }

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(`Saga with order id ${orderId.toValue()}`);
      }

      sagaInstance.advanceStep(OrderProcessingSagaStep.PAYMENT_CANCELED);

      payment.cancel();

      await paymentRepository.persist(payment);
      await sagaInstanceRepository.persist(sagaInstance);

      this.logger.log(
        `Payment for canceled order with ID ${orderId.toValue()} has been successfully canceled`,
      );
    });
  }
}
