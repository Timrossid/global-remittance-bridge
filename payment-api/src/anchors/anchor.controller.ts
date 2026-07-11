import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AnchorManagerService } from './anchor-manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('anchors')
export class AnchorController {
  constructor(private readonly anchorManager: AnchorManagerService) {}

  @Get('quote')
  async getQuote(@Query('from') from: string, @Query('to') to: string, @Query('amount') amount: string) {
    return this.anchorManager.getBestQuote(from, to, parseFloat(amount));
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  async deposit(@Body() data: { anchor: string, amount: number, asset: string, userId: string }) {
    const adapter = this.anchorManager.getAdapter(data.anchor);
    return adapter.initiateDeposit(data.userId, data.amount, data.asset);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  async withdraw(@Body() data: { anchor: string, amount: number, asset: string, userId: string, destination: string }) {
    const adapter = this.anchorManager.getAdapter(data.anchor);
    return adapter.initiateWithdrawal(data.userId, data.amount, data.asset, data.destination);
  }
}
