import { ITokens } from '../../ports/token.service';

export class AuthTokenDto implements ITokens {
  accessToken: string;
}
