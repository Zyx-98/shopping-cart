import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/core/domain/user/repositories/user.repository';
import { HASHING_SERVICE, IHashingService } from '../../../ports/hasing.service';
import { ValidateUserCommand } from './validate-user.command';
import { AuthenticatedUserDto } from '../../dtos/authenticated-user.dto';

@Injectable()
export class ValidateUserHandler {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE) private readonly hashingService: IHashingService,
  ) {}

  async execute(command: ValidateUserCommand): Promise<AuthenticatedUserDto> {
    const { email, plainPassword } = command;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.hashingService.compare(
      plainPassword,
      user.getPassword().value,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUserDto = new AuthenticatedUserDto();
    authUserDto.id = user.getUserId().toString();
    authUserDto.email = user.getEmail().toString();

    return authUserDto;
  }
}
