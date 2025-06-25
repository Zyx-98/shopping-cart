import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReserveInventoryForOrderCommand } from './reserve-inventory-for-order.command';
import {
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderInventoryReservationFailedEvent } from '../../event/order-inventory-reservation-failed.event';
import { OrderInventoryReservedEvent } from '../../event/order-inventory-reserved.event';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { InventoryId } from 'src/core/domain/inventory/value-object/inventory-id.vo';
import { Version } from 'src/core/domain/shared/domain/value-object/version.vo';

@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  private readonly logger = new Logger(ReserveInventoryForOrderHandler.name);

  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReserveInventoryForOrderCommand): Promise<void> {
    const { orderId, orderLines } = command;

    try {
      await this.unitOfWork.execute(async () => {
        const { inventoryRepository, sagaInstanceRepository } = this.unitOfWork;

        const sagaInstance =
          await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
            orderId,
          );

        if (!sagaInstance) {
          throw new NotFoundException(
            `Cannot reserve inventory: No saga instance found for orderId: ${orderId.toValue()} `,
          );
        }

        const inventories = await inventoryRepository.findAllByProductId(
          orderLines.map((line) => line.productId),
        );
        const versionMap = new Map<InventoryId, Version>();

        for (const inventory of inventories) {
          this.logger.log(
            `Reserving inventory for product: ${inventory.productId.toString()}`,
          );

          const orderLine = orderLines.find((line) =>
            line.productId.equals(inventory.productId),
          );

          if (!orderLine) {
            this.logger.warn(
              `No order line found for product: ${inventory.productId.toString()}`,
            );
            continue;
          }

          this.logger.log(
            `Reserving ${orderLine.quantity.value} units of inventory for product: ${inventory.productId.toString()}`,
          );

          inventory.removeQuantity(orderLine.quantity);
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

        sagaInstance.advanceStep(OrderProcessingSagaStep.INVENTORY_RESERVED);

        await sagaInstanceRepository.persist(sagaInstance);

        this.logger.log(
          `Inventory reservation successful for order ID: ${orderId.toValue()}`,
        );
        this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
      });
    } catch (error) {
      this.logger.error(
        `Failed to reserve inventory for order with ID ${orderId.toValue()}`,
      );

      if (!(error instanceof ConflictException)) {
        await this.unitOfWork.execute(async () => {
          const { sagaInstanceRepository } = this.unitOfWork;

          const sagaInstance =
            await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
              orderId,
            );

          if (sagaInstance) {
            sagaInstance.advanceStep(
              OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED,
            );
            await sagaInstanceRepository.persist(sagaInstance);
          }
        });

        this.eventBus.publish(
          new OrderInventoryReservationFailedEvent(orderId),
        );

        return;
      }

      throw error;
    }
  }
}
