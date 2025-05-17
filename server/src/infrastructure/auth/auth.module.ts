import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ValidateUserHandler } from 'src/core/application/auth/command/validate-user/validate-user.handler';
import { HASHING_SERVICE } from 'src/core/application/port/hashing.service';
import { BcryptHashingService } from './services/bcrypt-hashing.service';
import { TOKEN_SERVICE } from 'src/core/application/port/token.service';
import { JwtTokenService } from './services/jwt-token.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: HASHING_SERVICE,
      useClass: BcryptHashingService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    ValidateUserHandler,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [PassportModule, JwtModule, TOKEN_SERVICE, HASHING_SERVICE],
})
export class AuthInfrastructureModule {}
