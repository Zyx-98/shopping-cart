import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReservedInventoryForOrderV2Command } from './reserve-inventory-for-order-v2.command';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/core/domain/port/unit-of-work.interface';
import {
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { InventoryId } from 'src/core/domain/inventory/value-object/inventory-id.vo';
import { Version } from 'src/core/domain/shared/domain/value-object/version.vo';
import { OrderProcessingSagaStep } from 'src/core/domain/saga/enum/order-processing-saga-step.enum';
import { ProductReservationSucceededForOrderEvent } from '../../event/product-reservation-succeeded-for-order.event';
import { OrderInventoryReservedEvent } from '../../event/order-inventory-reserved.event';
import { OrderInventoryReservationFailedEvent } from '../../event/order-inventory-reservation-failed.event';

@CommandHandler(ReservedInventoryForOrderV2Command)
export class ReservedInventoryForOrderV2Handler
  implements ICommandHandler<ReservedInventoryForOrderV2Command>
{
  private readonly logger: Logger = new Logger(
    ReservedInventoryForOrderV2Handler.name,
  );

  constructor(
    @Inject(UNIT_OF_WORK)
    public readonly unitOfWork: IUnitOfWork,
    public readonly eventBus: EventBus,
  ) {}

  async execute(command: ReservedInventoryForOrderV2Command): Promise<void> {
    const { orderId, orderLine, isLastRetry } = command;

    try {
      await this.unitOfWork.execute(async () => {
        const { inventoryRepository, sagaInstanceRepository } = this.unitOfWork;

        const sagaInstance =
          await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
            orderId,
          );

        if (!sagaInstance) {
          throw new NotFoundException(`
               Cannot reserve inventory: No saga instance found for orderId: ${orderId.toValue()} 
        `);
        }

        const inventory = await inventoryRepository.findByUniqueId(
          orderLine.productId,
        );

        if (!inventory) {
          throw new NotFoundException(
            `Cannot reserve inventory: No inventory found for productId: ${orderLine.productId.toValue()}`,
          );
        }

        const versionMap = new Map<InventoryId, Version>();

        inventory.removeQuantity(orderLine.quantity);
        versionMap.set(inventory.id, inventory.version);
        inventory.nextVersion();

        const updatedRows = await inventoryRepository.persistManyWithVersion(
          [inventory],
          versionMap,
        );

        if (updatedRows < 1) {
          throw new ConflictException(
            `Inventory conflict detected. Please retry.`,
          );
        }

        sagaInstance.markLineAsReserve({
          productId: orderLine.productId.toValue(),
          quantity: orderLine.quantity.value,
        });

        const nextOrderLine = sagaInstance.getNextLineToReserve();

        const sagaStep = nextOrderLine
          ? OrderProcessingSagaStep.INVENTORY_RESERVING
          : OrderProcessingSagaStep.INVENTORY_RESERVED;

        sagaInstance.advanceStep(sagaStep);

        await sagaInstanceRepository.persist(sagaInstance);

        if (!nextOrderLine) {
          this.eventBus.publish(new OrderInventoryReservedEvent(orderId));
        } else {
          this.eventBus.publish(
            new ProductReservationSucceededForOrderEvent(
              orderId,
              nextOrderLine,
            ),
          );
        }
      });
    } catch (error) {
      if (!(error instanceof ConflictException) || isLastRetry) {
        await this.unitOfWork.execute(async () => {
          const { sagaInstanceRepository } = this.unitOfWork;

          const sagaInstance =
            await sagaInstanceRepository.findByCorrelationId<SagaType.PLACE_ORDER>(
              orderId,
            );

          if (sagaInstance) {
            sagaInstance.fail(
              error?.message,
              OrderProcessingSagaStep.INVENTORY_RESERVE_FAILED,
            );
            await sagaInstanceRepository.persist(sagaInstance);
          }
        });

        this.eventBus.publish(
          new OrderInventoryReservationFailedEvent(orderId),
        );
      }

      throw error;
    }
  }
}
