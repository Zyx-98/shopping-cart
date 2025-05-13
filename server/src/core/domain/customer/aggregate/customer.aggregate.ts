import { AggregateRoot } from '@nestjs/cqrs';
import { CustomerId } from '../value-objects/customer-id.vo';
import { EmailAddress } from '../../shared/domain/value-objects/email.vo';
import { Address } from '../../shared/domain/value-objects/address.vo';

interface CustomerProps {
  id: CustomerId;
  name: string;
  email: EmailAddress;
  address?: Address | null;
}

export class CustomerAggregate extends AggregateRoot {
  private _customerId: CustomerId;
  private _name: string;
  private _email: EmailAddress;
  private _address?: Address | null;

  constructor(
    customerId: CustomerId,
    name: string,
    email: EmailAddress,
    address?: Address | null,
  ) {
    super();
    this._customerId = customerId;
    this._name = name;
    this._email = email;
    this._address = address;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email.toString();
  }

  get address(): string | undefined {
    return this._address?.toString();
  }

  public static reconstitute(props: CustomerProps): CustomerAggregate {
    return new CustomerAggregate(
      props.id,
      props.name,
      props.email,
      props.address,
    );
  }
}
