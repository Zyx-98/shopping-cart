import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/infrastructure/auth/guards/local.guard';
import { LoginRequestDto } from '../dto/login-request.dto';
import { AuthenticatedUserDto } from 'src/core/application/auth/dto/authenticated-user.dto';
import { AuthTokenDto } from 'src/core/application/auth/dto/auth-token.dto';
import { LoginCommand } from 'src/core/application/auth/command/login/login.command';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../shared/request/request-with-user.request';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Login successfully, return JWT token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (Invalid Credentials)',
  })
  async login(@Req() req: RequestWithUser): Promise<AuthTokenDto> {
    const command = new LoginCommand(req.user);

    return this.commandBus.execute(command);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get the profile of the currently logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
    type: AuthenticatedUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (Token invalid or missing)',
  })
  getMe(@Req() req: RequestWithUser): AuthenticatedUserDto {
    return req.user;
  }
}
