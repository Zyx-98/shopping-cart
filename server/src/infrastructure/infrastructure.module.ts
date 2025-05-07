import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthInfrastructureModule } from './auth/auth.module';

@Module({
  imports: [PersistenceModule, AuthInfrastructureModule],
  exports: [PersistenceModule, AuthInfrastructureModule],
})
export class InfrastructureModule {}
