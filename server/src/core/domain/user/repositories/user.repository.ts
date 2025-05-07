import { UserAggregate } from '../aggregate/user.aggregate';
import { UserId } from '../value-objects/user-id.vo';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserAggregate | null>;
  findById(id: UserId): Promise<UserAggregate | null>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
