import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticatedUserDto } from 'src/core/application/auth/dto/authenticated-user.dto';
import { ValidateUserCommand } from 'src/core/application/auth/command/validate-user/validate-user.command';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({
      usernameField: 'email',
    });
  }

  async validate(
    email: string,
    plainPassword: string,
  ): Promise<AuthenticatedUserDto> {
    try {
      const command = new ValidateUserCommand(email, plainPassword);
      const userDto = await this.commandBus.execute(command);

      return userDto;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed.');
    }
  }
}
