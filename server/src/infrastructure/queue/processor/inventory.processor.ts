import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
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

@Processor(QueueType.INVENTORY, { concurrency: 3 })
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
      default:
        break;
    }
  }

  async handleReserveInventory(
    job: Job<QueueJobData[QueueJobName.RESERVE_INVENTORY]>,
  ) {
    const { orderId } = job.data;

    const order = await this.orderRepository.findById(OrderId.create(orderId));

    if (!order) {
      this.logger.error(`Order with ID ${orderId} not found`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    await this.commandBus.execute(
      new ReserveInventoryForOrderCommand(order.id, order.orderLines),
    );
  }
}
