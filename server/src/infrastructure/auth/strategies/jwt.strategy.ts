import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUserDto } from 'src/core/application/auth/dto/authenticated-user.dto';
import { TokenPayload } from 'src/core/application/ports/token.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/core/domain/user/repository/user.repository';
import { UserId } from 'src/core/domain/user/value-object/user-id.vo';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in the configuration.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: TokenPayload): Promise<AuthenticatedUserDto> {
    const user = await this.userRepository.findById(new UserId(payload.sub));
    if (!user) {
      throw new UnauthorizedException('User not found or inactive.');
    }

    const authUserDto = new AuthenticatedUserDto();
    authUserDto.id = payload.sub;
    authUserDto.email = user.getEmail().toString();
    authUserDto.customerId = payload.customerId;

    return authUserDto;
  }
}
