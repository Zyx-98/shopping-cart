import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOrderFailCommand } from './mark-order-fail.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(MarkOrderFailCommand)
export class MarkOrderFailHandler
  implements ICommandHandler<MarkOrderFailCommand>
{
  private readonly logger = new Logger(MarkOrderFailHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: MarkOrderFailCommand): Promise<void> {
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
          `Saga not found with orderId: ${orderId.toValue()}`,
        );
      }

      order.markAsFail();

      await orderRepository.persist(order);

      sagaInstance.fail(`Order failed`, OrderProcessingSagaStep.ORDER_FAILED);

      await sagaInstanceRepository.persist(sagaInstance);

      this.logger.log(
        `Order with ID ${orderId.toString()} marked as failed successfully`,
      );
    });
  }
}
