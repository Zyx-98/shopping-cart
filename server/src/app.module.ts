import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppDataSource } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables
    TypeOrmModule.forRoot(AppDataSource.options),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
