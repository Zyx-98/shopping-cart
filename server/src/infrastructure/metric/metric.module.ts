import { Module } from '@nestjs/common';
import { MetricService } from './metric.service';
import { MetricController } from './metric.controller';
import { MetricSecurityInterceptor } from './metric-security.interceptor';

@Module({
  providers: [MetricService, MetricSecurityInterceptor],
  controllers: [MetricController],
  exports: [MetricService],
})
export class MetricModule {}
