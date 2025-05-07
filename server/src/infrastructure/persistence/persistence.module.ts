import { Global, Module } from '@nestjs/common';
import { TypeormPersistenceModule } from './typeorm/typeorm-persistence.module';

@Global()
@Module({
  imports: [TypeormPersistenceModule],
  exports: [TypeormPersistenceModule],
})
export class PersistenceModule {}
