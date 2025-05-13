import { AuthenticatedUserDto } from 'src/core/application/auth/dto/authenticated-user.dto';

export interface RequestWithUser extends Request {
  user: AuthenticatedUserDto;
}
