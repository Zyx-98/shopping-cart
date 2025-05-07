import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from 'src/core/domain/user/repositories/user.repository';
import { UserRepository } from './repositories/user.repository';
import { UserSchema } from './entities/user.schema';
import { UserMapper } from './mappers/user.mapper';
import { typeOrmAsyncConfig } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
  ],
  providers: [
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class TypeormPersistenceModule {}
