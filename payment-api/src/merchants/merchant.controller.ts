import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MerchantService } from './merchant.service';
import { PaginationService } from '../common/services/pagination.service';

@Controller('merchants')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly paginationService: PaginationService,
  ) {}

  @Post('onboard')
  async onboard(@Body() createMerchantDto: any) {
    return this.merchantService.createMerchant(createMerchantDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.merchantService.getMerchantById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getStats(@Request() req) {
    return this.merchantService.getStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/analytics')
  async getAnalytics(@Request() req) {
    return this.merchantService.getAnalytics(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/transactions')
  async getTransactions(@Request() req, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.merchantService.getTransactions(req.user.userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/kyc')
  async updateKyc(@Param('id') id: string, @Body('status') status: string) {
    return this.merchantService.updateKycStatus(id, status);
  }
}
