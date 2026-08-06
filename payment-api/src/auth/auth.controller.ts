import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  name: string;
  email: string;
  password: string;
  walletAddress: string;
}

class LoginDto {
  email: string;
  password: string;
}

class RefreshDto {
  refresh_token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (!dto.email || !dto.password || !dto.name || !dto.walletAddress) {
      throw new BadRequestException('name, email, password, and walletAddress are required');
    }
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('email and password are required');
    }
    const result = await this.authService.login(dto.email, dto.password);
    if (!result) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    if (!dto.refresh_token) {
      throw new BadRequestException('refresh_token is required');
    }
    return this.authService.refreshAccessToken(dto.refresh_token);
  }
}
