import { CustomerId } from '../value-object/customer-id.vo';
import { EmailAddress } from '../../shared/domain/value-object/email.vo';
import { Address } from '../../shared/domain/value-object/address.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

interface CustomerProps {
  id: CustomerId;
  name: string;
  email: EmailAddress;
  address?: Address | null;
}

export class CustomerAggregate extends BaseAggregateRoot<CustomerId> {
  private _name: string;
  private _email: EmailAddress;
  private _address?: Address | null;

  constructor(props: CustomerProps) {
    super(props.id);
    this._name = props.name;
    this._email = props.email;
    this._address = props.address;
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
    return new CustomerAggregate(props);
  }
}
