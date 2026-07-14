import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  /**
   * POST /merchants/onboard
   * Public: creates a basic merchant record (full auth via /auth/register).
   */
  @Post('onboard')
  async onboard(@Body() createMerchantDto: any) {
    return this.merchantService.createMerchant(createMerchantDto);
  }

  /**
   * GET /merchants/me
   * Returns the authenticated merchant's profile.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.merchantService.getMerchantById(req.user.userId);
  }

  /**
   * GET /merchants/me/stats
   * Returns aggregated stats for the dashboard.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getStats(@Request() req) {
    return this.merchantService.getStats(req.user.userId);
  }

  /**
   * GET /merchants/me/transactions
   * Returns the merchant's transaction history (most recent first).
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/transactions')
  async getTransactions(@Request() req) {
    return this.merchantService.getTransactions(req.user.userId);
  }

  /**
   * PUT /merchants/:id/kyc
   * Admin-level endpoint to update KYC status.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/kyc')
  async updateKyc(@Param('id') id: string, @Body('status') status: string) {
    return this.merchantService.updateKycStatus(id, status);
  }
}
