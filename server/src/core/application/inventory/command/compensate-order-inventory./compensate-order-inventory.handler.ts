import {
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CompensateOrderInventoryCommand } from './compensate-order-inventory.command';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { InventoryId } from 'src/core/domain/inventory/value-object/inventory-id.vo';
import { Version } from 'src/core/domain/shared/domain/value-object/version.vo';
import { CompensatedInventoryForOrderEvent } from '../../event/compensated-inventory-for-order.event';

@CommandHandler(CompensateOrderInventoryCommand)
export class CompensateOrderInventoryHandler
  implements ICommandHandler<CompensateOrderInventoryCommand>
{
  private readonly logger = new Logger(CompensateOrderInventoryHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CompensateOrderInventoryCommand): Promise<void> {
    const { orderId, products } = command;

    await this.unitOfWork.execute(async () => {
      const { inventoryRepository, sagaInstanceRepository } = this.unitOfWork;

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
          orderId,
        );

      if (!sagaInstance) {
        throw new NotFoundException(
          `Cannot compensate inventory: No saga instance not found for orderId: ${orderId.toValue()}`,
        );
      }

      const inventories = await inventoryRepository.findAllByProductId(
        products.map((product) => product.productId),
      );

      const versionMap = new Map<InventoryId, Version>();

      for (const inventory of inventories) {
        const product = products.find((product) =>
          product.productId.equals(inventory.productId),
        );

        if (!product) {
          this.logger.error(
            `Product not found for inventory: ${inventory.productId.toString()}`,
          );
          throw new NotFoundException(
            `Product not found for inventory: ${inventory.productId.toString()}`,
          );
        }

        inventory.addQuantity(product.quantity);
        versionMap.set(inventory.id, inventory.version);
        inventory.nextVersion();
      }

      const updatedRows = await inventoryRepository.persistManyWithVersion(
        inventories,
        versionMap,
      );

      if (updatedRows !== inventories.length) {
        this.logger.warn(
          `Optimistic lock conflict for order ID: ${orderId.toValue()}. Will trigger retry.`,
        );
        throw new ConflictException(
          'Inventory conflict detected. Please retry.',
        );
      }

      sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);
      await sagaInstanceRepository.persist(sagaInstance);
    });

    this.eventBus.publish(new CompensatedInventoryForOrderEvent(orderId));
  }
}
