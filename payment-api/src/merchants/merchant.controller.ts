import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

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
  @Put(':id/kyc')
  async updateKyc(@Param('id') id: string, @Body('status') status: string) {
    return this.merchantService.updateKycStatus(id, status);
  }
}
