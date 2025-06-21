import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PayForOrderCommand } from './pay-for-order.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(PayForOrderCommand)
export class PayForOrderHandler implements ICommandHandler<PayForOrderCommand> {
  private readonly logger = new Logger(PayForOrderHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly publisher: EventPublisher,
  ) {}
  async execute(
    command: PayForOrderCommand,
  ): Promise<{ success: boolean; failed: boolean }> {
    const { paymentId, amount } = command;

    const result = {
      success: false,
      failed: false,
    };

    await this.unitOfWork.execute(async () => {
      const { paymentRepository, sagaInstanceRepository } = this.unitOfWork;

      let payment = await paymentRepository.findById(paymentId);

      if (!payment) {
        throw new NotFoundException(
          `Payment not found with id ${paymentId.toString()}`,
        );
      }

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          payment.orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(
          `Saga with order id ${payment.orderId.toValue()} not found`,
        );
      }

      payment = this.publisher.mergeObjectContext(payment);

      // This condition is assumed to indicate a failed payment
      if (payment.totalItemPrice.equals(amount)) {
        payment.markAsPaid();
        result.success = true;
        sagaInstance.advanceStep(OrderProcessingSagaStep.PAYMENT_SUCCEEDED);
      } else {
        payment.markAsFailed();
        result.failed = true;
        sagaInstance.advanceStep(OrderProcessingSagaStep.PAYMENT_FAILED);
      }

      await paymentRepository.persist(payment);
      await sagaInstanceRepository.persist(sagaInstance);

      payment.commit();
      this.logger.log(
        `Payment with ID ${paymentId.toString()} processed successfully`,
      );
    });

    return result;
  }
}
