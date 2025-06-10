import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InitiatePaymentCommand } from './initiate-payment.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(InitiatePaymentCommand)
export class InitiatePaymentHandler
  implements ICommandHandler<InitiatePaymentCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: InitiatePaymentCommand): Promise<any> {
    const { orderId, totalItemPrice } = command;

    await this.unitOfWork.execute(async () => {
      const { paymentRepository, sagaInstanceRepository } = this.unitOfWork;

      const payment = PaymentAggregate.create(orderId, totalItemPrice);

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
  }
}
