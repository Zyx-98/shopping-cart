import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderAwaitingPaymentCommand } from './mark-order-awaiting-payment.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(MarkOrderAwaitingPaymentCommand)
export class MarkOrderAwaitingPaymentHandler
  implements ICommandHandler<MarkOrderAwaitingPaymentCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: MarkOrderAwaitingPaymentCommand): Promise<any> {
    const { orderId } = command;

    await this.unitOfWork.execute(async () => {
      const { orderRepository, sagaInstanceRepository } = this.unitOfWork;

      const order = await orderRepository.findById(orderId);

      if (!order) {
        throw new NotFoundException(
          `Order with ID ${orderId.toString()} not found`,
        );
      }

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(
          `Saga with order Id ${orderId.toString()} not found`,
        );
      }

      order.markAsAwaitPayment();

      await orderRepository.persist(order);

      sagaInstance.advanceStep(OrderProcessingSagaStep.PAYMENT_PROCESSING);

      await sagaInstanceRepository.persist(sagaInstance);
    });
  }
}
