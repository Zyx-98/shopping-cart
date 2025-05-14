import { Injectable } from '@nestjs/common';
import { UserSchema } from '../entities/user.schema';
import { UserAggregate } from 'src/core/domain/user/aggregate/user.aggregate';
import { UserId } from 'src/core/domain/user/value-object/user-id.vo';
import { EmailAddress } from 'src/core/domain/shared/domain/value-object/email.vo';
import { Password } from 'src/core/domain/user/value-object/password.vo';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PersistenceUserMapper {
  toDomain(schema: UserSchema): UserAggregate {
    return UserAggregate.reconstitute({
      id: UserId.create(schema.uuid),
      email: EmailAddress.create(schema.email),
      password: Password.createFromHash(schema.passwordHash),
    });
  }
  toPersistence(aggregate: UserAggregate): DeepPartial<UserSchema> {
    return {
      uuid: aggregate.getUserId().toString(),
      email: aggregate.getEmail().toString(),
      passwordHash: aggregate.getPassword().value,
    };
  }
}
