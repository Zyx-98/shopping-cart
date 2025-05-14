import { CustomerAggregate } from 'src/core/domain/customer/aggregate/customer.aggregate';
import { ICustomerRepository } from 'src/core/domain/customer/repository/customer.repository';
import { UserId } from 'src/core/domain/user/value-object/user-id.vo';
import { PersistenceCustomerMapper } from '../mappers/persistence-customer.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerSchema } from '../entities/customer.schema';
import { Repository } from 'typeorm';
import { UserSchema } from '../entities/user.schema';

export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerSchema)
    private readonly customerRepository: Repository<CustomerSchema>,
    @InjectRepository(UserSchema)
    private readonly userRepository: Repository<UserSchema>,
    private readonly mapper: PersistenceCustomerMapper,
  ) {}
  async findByUserId(userId: UserId): Promise<CustomerAggregate | null> {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userId.toString(),
      },
    });

    if (!user) return null;

    const schema = await this.customerRepository.findOne({
      where: { userId: user.id },
    });

    if (!schema) return null;

    return this.mapper.toDomain(schema);
  }
}
