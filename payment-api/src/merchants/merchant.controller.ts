import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMerchantDto, UpdateKycDto } from './dto/merchant.dto';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('onboard')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onboard(@Body() createMerchantDto: CreateMerchantDto) {
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
  async getTransactions(@Request() req) {
    return this.merchantService.getTransactions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/kyc')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateKyc(@Param('id') id: string, @Body() data: UpdateKycDto) {
    return this.merchantService.updateKycStatus(id, data.status);
  }
}
