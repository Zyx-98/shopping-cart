import { Command } from '@nestjs/cqrs';
import { AuthenticatedUserDto } from '../../dto/authenticated-user.dto';

export class ValidateUserCommand extends Command<AuthenticatedUserDto> {
  constructor(
    public readonly email: string,
    public readonly plainPassword: string,
  ) {
    super();
  }
}
