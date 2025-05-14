import { Injectable } from '@nestjs/common';
import { CustomerSchema } from '../entities/customer.schema';
import { CustomerAggregate } from 'src/core/domain/customer/aggregate/customer.aggregate';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { EmailAddress } from 'src/core/domain/shared/domain/value-object/email.vo';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PersistenceCustomerMapper {
  toDomain(schema: CustomerSchema): CustomerAggregate {
    return CustomerAggregate.reconstitute({
      id: CustomerId.create(schema.uuid),
      name: schema.name,
      email: EmailAddress.create(schema.email),
    });
  }

  toPersistence(aggregate: CustomerAggregate): DeepPartial<CustomerSchema> {
    return {
      uuid: aggregate.id.toString(),
      email: aggregate.email,
      name: aggregate.name,
    };
  }
}
