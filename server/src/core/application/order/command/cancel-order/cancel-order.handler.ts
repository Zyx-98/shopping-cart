import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from './cancel-order.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  private readonly logger = new Logger(CancelOrderHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const { orderId } = command;
      const { orderRepository, sagaInstanceRepository, paymentRepository } =
        this.unitOfWork;

      const order = await orderRepository.findById(orderId);

      if (!order) {
        this.logger.error(`Order with ID ${orderId.toString()} not found`);
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
          `Saga with orderId ${orderId.toString()} not found`,
        );
      }

      const payment = await paymentRepository.findByOrderId(orderId);

      order.cancelOrder(payment?.id);

      this.publisher.mergeObjectContext(order);

      await orderRepository.persist(order);

      sagaInstance.advanceStep(OrderProcessingSagaStep.ORDER_CANCELED);

      await sagaInstanceRepository.persist(sagaInstance);

      order.commit();
      this.logger.log(
        `Order with ID ${orderId.toString()} canceled successfully`,
      );
    });
  }
}
