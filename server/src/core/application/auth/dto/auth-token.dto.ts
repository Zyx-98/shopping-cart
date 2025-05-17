import { ApiProperty } from '@nestjs/swagger';
import { ITokens } from '../../port/token.service';

export class AuthTokenDto implements ITokens {
  @ApiProperty()
  accessToken: string;
}
