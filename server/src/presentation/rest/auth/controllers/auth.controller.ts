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
import { LoginHandler } from 'src/core/application/command/login/login.handler';
import { LocalAuthGuard } from 'src/infrastructure/auth/guards/local.guard';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { AuthenticatedUserDto } from 'src/core/application/auth/dtos/authenticated-user.dto';
import { AuthTokenDto } from 'src/core/application/auth/dtos/auth-token.dto';
import { LoginCommand } from 'src/core/application/command/login/login.command';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: AuthenticatedUserDto;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginHandler: LoginHandler) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Login successfule, return JWT token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (Invalid Credentials)',
  })
  async login(@Req() req: RequestWithUser): Promise<AuthTokenDto> {
    const command = new LoginCommand(req.user);

    return this.loginHandler.execute(command);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  getProfile(@Req() req: RequestWithUser): AuthenticatedUserDto {
    return req.user;
  }
}
