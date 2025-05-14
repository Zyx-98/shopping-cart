import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { LoginHandler } from 'src/core/application/auth/command/login/login.handler';

@Module({
  controllers: [AuthController],
  providers: [LoginHandler],
})
export class AuthModule {}
