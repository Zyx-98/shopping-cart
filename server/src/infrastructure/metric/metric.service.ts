// src/metrics/metrics.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as client from 'prom-client'; // Import prom-client as client

@Injectable()
export class MetricService implements OnModuleInit, OnModuleDestroy {
  public httpRequestTotal: client.Counter;
  public httpRequestDuration: client.Histogram;
  private readonly registry: client.Registry;

  constructor() {
    this.registry = client.register;

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // client.collectDefaultMetrics();
  }

  onModuleDestroy() {
    this.registry.clear();
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
