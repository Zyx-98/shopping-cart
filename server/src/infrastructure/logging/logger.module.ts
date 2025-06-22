import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonTransports } from './winston.config';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: createWinstonTransports(),
    }),
  ],
})
export class LoggerModule {}
