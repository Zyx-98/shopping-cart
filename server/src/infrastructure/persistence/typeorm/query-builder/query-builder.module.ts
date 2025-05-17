import { Module } from '@nestjs/common';
import { TypeOrmQueryBuilderService } from './typeorm-query-builder.service';

@Module({
  providers: [TypeOrmQueryBuilderService],
  exports: [TypeOrmQueryBuilderService],
})
export class TypeormQueryBuilderModule {}
