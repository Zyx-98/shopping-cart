import { AuthenticatedUserDto } from '../../auth/dtos/authenticated-user.dto';

export class LoginCommand {
  constructor(public readonly user: AuthenticatedUserDto) {}
}
