import { InjectRepository } from '@nestjs/typeorm';
import { UserAggregate } from 'src/core/domain/user/aggregate/user.aggregate';
import { IUserRepository } from 'src/core/domain/user/repositories/user.repository';
import { UserId } from 'src/core/domain/user/value-objects/user-id.vo';
import { UserSchema } from '../entities/user.schema';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers/user.mapper';

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly ormRepository: Repository<UserSchema>,
    private readonly mapper: UserMapper,
  ) {}

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: { email },
    });

    if (!schema) {
      return null;
    }

    return this.mapper.toDomain(schema);
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: { uuid: id.toString() },
    });

    if (!schema) {
      return null;
    }

    return this.mapper.toDomain(schema);
  }
}
