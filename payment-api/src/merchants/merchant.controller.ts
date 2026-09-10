import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { CreateMerchantDto, UpdateKycDto } from './dto/merchant.dto';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('onboard')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onboard(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.createMerchant(createMerchantDto);
  }

  @UseGuards(JwtAuthGuard, ApiKeyAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.merchantService.getMerchantById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, ApiKeyAuthGuard)
  @Get('me/stats')
  async getStats(@Request() req) {
    return this.merchantService.getStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, ApiKeyAuthGuard)
  @Get('me/analytics')
  async getAnalytics(@Request() req) {
    return this.merchantService.getAnalytics(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, ApiKeyAuthGuard)
  @Get('me/transactions')
  async getTransactions(@Request() req, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.merchantService.getTransactions(req.user.userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/kyc')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateKyc(@Param('id') id: string, @Body() data: UpdateKycDto) {
    return this.merchantService.updateKycStatus(id, data.status);
  }
}
