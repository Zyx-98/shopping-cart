import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  JobStatus,
  QueueJobData,
  QueueJobName,
  QueueType,
} from 'src/core/application/port/queue.service';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { JobRepository } from 'src/infrastructure/persistence/typeorm/repositories/queue.repository';

@Processor(QueueType.INVENTORY, { concurrency: 1 })
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name);
  constructor(
    private readonly jobRepository: JobRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
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
      default:
        break;
    }
  }

  async handleReserveInventory(
    job: Job<QueueJobData[QueueJobName.RESERVE_INVENTORY]>,
  ) {
    const { productId, quantity } = job.data;

    const inventory = await this.inventoryRepository.findByUniqueId(
      ProductId.create(productId),
    );

    if (!inventory) {
      throw new Error(`Inventory not found for productId: ${productId}`);
    }

    inventory.removeQuantity(Quantity.create(quantity));

    await this.inventoryRepository.persist(inventory);
  }

  async handleCompensateInventory(
    job: Job<QueueJobData[QueueJobName.COMPENSATE_INVENTORY]>,
  ) {
    const { productId, quantity } = job.data;

    const inventory = await this.inventoryRepository.findByUniqueId(
      ProductId.create(productId),
    );

    if (!inventory) {
      throw new Error(`Inventory not found for productId: ${productId}`);
    }

    inventory.addQuantity(Quantity.create(quantity));

    await this.inventoryRepository.persist(inventory);
  }

  @OnQueueEvent('active')
  async onActive(job: Job) {
    await this.jobRepository.updateStatus(String(job.id), JobStatus.ACTIVE);
  }

  @OnQueueEvent('completed')
  async onCompleted(job: Job, _result: any) {
    await this.jobRepository.updateStatus(String(job.id), JobStatus.COMPLETED);
  }

  @OnQueueEvent('failed')
  async onFailed(job: Job, _err: Error) {
    await this.jobRepository.updateStatus(String(job.id), JobStatus.FAILED);
  }
}
