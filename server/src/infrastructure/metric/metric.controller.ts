import {
  Controller,
  Get,
  Res,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { MetricService } from './metric.service';
import { MetricSecurityInterceptor } from './metric-security.interceptor';

@Controller({
  path: 'metrics',
  version: VERSION_NEUTRAL,
})
@UseInterceptors(MetricSecurityInterceptor)
export class MetricController {
  constructor(private readonly metricsService: MetricService) {}

  @Get()
  async getMetrics(@Res() reply: FastifyReply): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    reply.type('text/plain').send(metrics);
  }
}
