import { AggregateRoot } from '@nestjs/cqrs';
import { UserId } from '../value-objects/user-id.vo';
import { EmailAddress } from '../../shared/domain/value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

interface UserProps {
  id: UserId;
  email: EmailAddress;
  password: Password;
}

export class UserAggregate extends AggregateRoot {
  constructor(
    private readonly userId: UserId,
    private readonly email: EmailAddress,
    private readonly password: Password,
  ) {
    super();
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getEmail(): EmailAddress {
    return this.email;
  }

  public getPassword(): Password {
    return this.password;
  }

  public static reconstitute(props: UserProps): UserAggregate {
    return new UserAggregate(props.id, props.email, props.password);
  }
}
