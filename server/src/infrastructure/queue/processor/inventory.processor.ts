import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { CompensateOrderInventoryCommand } from 'src/core/application/inventory/command/compensate-order-inventory./compensate-order-inventory.command';
import { ReleaseProductReservationForOrderCommand } from 'src/core/application/inventory/command/release-product-reservation-for-order/release-product-reservation-for-order.command';
import { ReservedInventoryForOrderV2Command } from 'src/core/application/inventory/command/reserve-inventory-for-order-v2/reserve-inventory-for-order-v2.command';
import { ReserveInventoryForOrderCommand } from 'src/core/application/inventory/command/reserve-inventory-for-order/reserve-inventory-for-order.command';
import {
  QueueJobData,
  QueueJobName,
  QueueType,
} from 'src/core/application/port/queue.service';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/order/repository/order.repository';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';

@Processor(QueueType.INVENTORY, { concurrency: 1 })
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name);
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  async process(job: Job<any, any, QueueJobName>): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data:`,
      job.data,
    );

    switch (job.name) {
      case QueueJobName.RESERVE_INVENTORY:
        return this.handleReserveInventory(job);
      case QueueJobName.COMPENSATE_INVENTORY:
        return this.handleCompensateInventory(job);
      case QueueJobName.RESERVE_INVENTORY_WITH_SINGLE_PRODUCT:
        return this.handleReserveInventoryWithSingleProduct(job);
      case QueueJobName.RELEASE_PRODUCT_RESERVATION:
        return this.handleReleaseProductReservation(job);
      default:
        break;
    }
  }

  async handleReserveInventory(
    job: Job<QueueJobData[QueueJobName.RESERVE_INVENTORY]>,
  ) {
    const { orderId, orderLines } = job.data;

    await this.commandBus.execute(
      new ReserveInventoryForOrderCommand(
        OrderId.create(orderId),
        orderLines.map((orderLine) => ({
          productId: ProductId.create(orderLine.productId),
          quantity: Quantity.create(orderLine.quantity),
        })),
      ),
    );
  }

  async handleReserveInventoryWithSingleProduct(
    job: Job<QueueJobData[QueueJobName.RESERVE_INVENTORY_WITH_SINGLE_PRODUCT]>,
  ) {
    const { orderId, orderLine } = job.data;

    await this.commandBus.execute(
      new ReservedInventoryForOrderV2Command(
        OrderId.create(orderId),
        {
          productId: ProductId.create(orderLine.productId),
          quantity: Quantity.create(orderLine.quantity),
        },
        job.attemptsMade === 4,
      ),
    );
  }

  async handleCompensateInventory(
    job: Job<QueueJobData[QueueJobName.COMPENSATE_INVENTORY]>,
  ) {
    const { orderId } = job.data;

    const order = await this.orderRepository.findById(OrderId.create(orderId));

    if (!order) {
      this.logger.error(`Order with ID ${orderId} not found`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    await this.commandBus.execute(
      new CompensateOrderInventoryCommand(
        order.id,
        order.orderLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      ),
    );
  }

  async handleReleaseProductReservation(
    job: Job<QueueJobData[QueueJobName.RELEASE_PRODUCT_RESERVATION]>,
  ) {
    const { orderId } = job.data;

    await this.commandBus.execute(
      new ReleaseProductReservationForOrderCommand(OrderId.create(orderId)),
    );
  }
}
