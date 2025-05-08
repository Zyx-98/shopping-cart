import { AuthenticatedUserDto } from '../../dtos/authenticated-user.dto';

export class LoginCommand {
  constructor(public readonly user: AuthenticatedUserDto) {}
}
