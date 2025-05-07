import { Module } from '@nestjs/common';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [RestModule],
  exports: [RestModule],
})
export class PresentationModule {}
