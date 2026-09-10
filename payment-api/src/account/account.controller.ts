import { Controller, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SoftDeleteService } from '../common/services/soft-delete.service';
import { PrismaService } from '../common/prisma.service';

@Controller('account')
export class AccountController {
  constructor(
    private readonly softDeleteService: SoftDeleteService,
    private readonly prisma: PrismaService,
  ) {}

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req) {
    await this.softDeleteService.softDelete('user', req.user.userId);
    await this.prisma.refreshToken.updateMany({
      where: { userId: req.user.userId },
      data: { revoked: true },
    });
    return { message: 'Account deleted successfully' };
  }
}
