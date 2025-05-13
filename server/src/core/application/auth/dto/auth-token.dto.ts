import { ApiProperty } from '@nestjs/swagger';
import { ITokens } from '../../ports/token.service';

export class AuthTokenDto implements ITokens {
  @ApiProperty()
  accessToken: string;
}
