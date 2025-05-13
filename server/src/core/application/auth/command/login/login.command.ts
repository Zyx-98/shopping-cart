import { AuthenticatedUserDto } from '../../dto/authenticated-user.dto';

export class LoginCommand {
  constructor(public readonly user: AuthenticatedUserDto) {}
}
