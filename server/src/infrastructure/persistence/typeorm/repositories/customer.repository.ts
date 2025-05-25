import { CustomerAggregate } from 'src/core/domain/customer/aggregate/customer.aggregate';
import { ICustomerRepository } from 'src/core/domain/customer/repository/customer.repository';
import { UserId } from 'src/core/domain/user/value-object/user-id.vo';
import { PersistenceCustomerMapper } from '../mappers/persistence-customer.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerSchema } from '../entities/customer.schema';
import { Repository } from 'typeorm';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';

export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerSchema)
    private readonly customerRepository: Repository<CustomerSchema>,
    private readonly mapper: PersistenceCustomerMapper,
  ) {}
  findAll(): Promise<CustomerAggregate[]> {
    throw new Error('Method not implemented.');
  }
  findById(_id: UniqueEntityId): Promise<CustomerAggregate | null> {
    throw new Error('Method not implemented.');
  }
  async findByUniqueId(userId: UserId): Promise<CustomerAggregate | null> {
    const schema = await this.customerRepository.findOne({
      where: { userId: userId.toString() },
    });

    if (!schema) return null;

    return this.mapper.toDomain(schema);
  }
}
