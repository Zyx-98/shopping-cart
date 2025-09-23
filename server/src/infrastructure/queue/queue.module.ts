import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  QUEUE_SERVICE,
  QueueType,
} from 'src/core/application/port/queue.service';
import { BullQueueService } from './bull-queue.service';
import { InventoryProcessor } from './processor/inventory.processor';
import { QueueLoaderService } from './queue-loader.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QueueType.INVENTORY,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: 500,
        },
      },
    }),
  ],
  providers: [
    {
      provide: QUEUE_SERVICE,
      useClass: BullQueueService,
    },
    InventoryProcessor,
    QueueLoaderService,
  ],
  exports: [QUEUE_SERVICE, QueueLoaderService],
})
export class QueueModule {}
