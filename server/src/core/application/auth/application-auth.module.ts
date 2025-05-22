import { Module } from '@nestjs/common';
import { ValidateUserHandler } from './command/validate-user/validate-user.handler';
import { LoginHandler } from './command/login/login.handler';

@Module({
  providers: [ValidateUserHandler, LoginHandler],
  exports: [ValidateUserHandler, LoginHandler],
})
export class ApplicationAuthModule {}
