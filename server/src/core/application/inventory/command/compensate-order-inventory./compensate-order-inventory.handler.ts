import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompensateOrderInventoryCommand } from './compensate-order-inventory.command';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';

@CommandHandler(CompensateOrderInventoryCommand)
export class CompensateOrderInventoryHandler
  implements ICommandHandler<CompensateOrderInventoryCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CompensateOrderInventoryCommand): Promise<void> {
    const { orderId, products } = command;

    // TODO need to implement a distributed lock to ensure inventory updates are safe and consistent in concurrent scenarios.
    await this.unitOfWork.execute(async () => {
      const { inventoryRepository, sagaInstanceRepository } = this.unitOfWork;

      const inventories = await inventoryRepository.findAllByProductId(
        products.map((product) => product.productId),
      );
      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(
          `Cannot compensate inventory: No saga instance not found for orderId: ${orderId.toValue()}`,
        );
      }

      for (const inventory of inventories) {
        const product = products.find((product) =>
          product.productId.equals(inventory.productId),
        );
        if (product) {
          inventory.addQuantity(product.quantity);
        }
      }

      await inventoryRepository.persistMany(inventories);
      sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);
      await sagaInstanceRepository.persist(sagaInstance);
    });
  }
}
