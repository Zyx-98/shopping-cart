import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseProductReservationForOrderCommand } from './release-product-reservation-for-order.command';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { InventoryId } from 'src/core/domain/inventory/value-object/inventory-id.vo';
import { Version } from 'src/core/domain/shared/domain/value-object/version.vo';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { ReleasedProductReservationForOrderEvent } from '../../event/released-product-reservation-for-order.event';

@CommandHandler(ReleaseProductReservationForOrderCommand)
export class ReleaseProductReservationForOrderHandler
  implements ICommandHandler<ReleaseProductReservationForOrderCommand>
{
  private readonly logger: Logger = new Logger(
    ReleaseProductReservationForOrderHandler.name,
  );

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: ReleaseProductReservationForOrderCommand,
  ): Promise<void> {
    const { orderId } = command;

    await this.unitOfWork.execute(async () => {
      const { sagaInstanceRepository, inventoryRepository } = this.unitOfWork;

      const sagaInstance =
        await sagaInstanceRepository.findByCorrelationId(orderId);

      if (!sagaInstance) {
        throw new NotFoundException(
          `Cannot release inventory: No saga instance found for orderId: ${orderId.toValue()}`,
        );
      }

      const reservedOrderLines =
        sagaInstance.getSuccessFullyReservedOrderLines();

      const versionMap = new Map<InventoryId, Version>();

      const inventories = await inventoryRepository.findAllByProductId(
        reservedOrderLines.map(({ productId }) => ProductId.create(productId)),
      );

      for (const inventory of inventories) {
        const reservedOrderLine = reservedOrderLines.find(
          ({ productId }) => inventory.productId.toValue() === productId,
        );

        if (!reservedOrderLine) {
          this.logger.warn(
            `No order line for inventory: ${inventory.id.toValue()}`,
          );
          continue;
        }

        inventory.addQuantity(Quantity.create(reservedOrderLine.quantity));
        versionMap.set(inventory.id, inventory.version);
        inventory.nextVersion();
      }

      const updatedRows = await inventoryRepository.persistManyWithVersion(
        inventories,
        versionMap,
      );

      if (updatedRows !== inventories.length) {
        this.logger.warn(
          `Optimistic lock conflict for orderId: ${orderId.toValue()}`,
        );
      }

      sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_COMPENSATED);

      await sagaInstanceRepository.persist(sagaInstance);

      this.eventBus.publish(
        new ReleasedProductReservationForOrderEvent(orderId),
      );
    });
  }
}
