import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderAsCompleteCommand } from './mark-order-as-complete.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(MarkOrderAsCompleteCommand)
export class MarkOrderAsCompleteHandler
  implements ICommandHandler<MarkOrderAsCompleteCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: MarkOrderAsCompleteCommand): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const { orderRepository, sagaInstanceRepository } = this.unitOfWork;

      const { orderId } = command;

      const order = await orderRepository.findById(orderId);

      if (!order) {
        throw new Error(`Order with ID ${orderId.toString()} not found`);
      }

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType>(orderId);

      if (!sagaInstance) {
        throw new NotFoundException(
          `Saga with orderId ${orderId.toValue()} not found`,
        );
      }

      order.completeOrder();

      await orderRepository.persist(order);

      sagaInstance.complete(OrderProcessingSagaStep.ORDER_COMPLETED);

      await sagaInstanceRepository.persist(sagaInstance);
    });
  }
}
