import { Inject, Injectable } from '@nestjs/common';
import {
  ITokenService,
  TOKEN_SERVICE,
  TokenPayload,
} from '../../../ports/token.service';
import { LoginCommand } from './login.command';
import { AuthTokenDto } from '../../dto/auth-token.dto';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokenDto> {
    const { user } = command;

    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      customerId: user.customerId,
    };

    const tokens = await this.tokenService.generateTokens(payload);

    const authTokenDto = new AuthTokenDto();
    authTokenDto.accessToken = tokens.accessToken;

    return authTokenDto;
  }
}
