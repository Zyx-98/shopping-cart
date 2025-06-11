import { Module } from '@nestjs/common';
import { OrderProcessingOrchestrator } from './orchestrator/order-processing.orchestrator';
import { OrderProcessingRecover } from './recover/order-processing.recover';

@Module({
  providers: [OrderProcessingOrchestrator, OrderProcessingRecover],
  exports: [OrderProcessingOrchestrator, OrderProcessingRecover],
})
export class ApplicationSagaModule {}
