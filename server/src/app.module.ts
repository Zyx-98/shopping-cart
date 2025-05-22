import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PresentationModule } from './presentation/presentation.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from './core/application/application.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }), // Load environment variables
    ApplicationModule,
    InfrastructureModule,
    PresentationModule,
  ],
})
export class AppModule {}
