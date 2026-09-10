import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { EmailVerificationService } from './services/email-verification.service';
import { TwoFactorService } from './services/two-factor.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../common/prisma.service';

@Controller('auth')
export class AuthExtendedController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly twoFactorService: TwoFactorService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const token = await this.passwordResetService.createResetToken(email);
    return { message: 'If the email exists, a reset link has been sent', token };
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    await this.passwordResetService.resetPassword(token, password);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    await this.emailVerificationService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2FA(@Request() req) {
    const secret = this.twoFactorService.generateSecret();
    return { secret };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Request() req, @Body('token') token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isValid = this.twoFactorService.verifyTOTP(token, user.twoFactorSecret || '');
    return { valid: isValid };
  }
}
