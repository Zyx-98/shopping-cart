import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { LoginHandler } from 'src/core/application/command/login/login.handler';

@Module({
  controllers: [AuthController],
  providers: [LoginHandler],
})
export class AuthModule {}
