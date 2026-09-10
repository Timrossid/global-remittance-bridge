import { Controller, Get, Post, Body, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AnchorManagerService } from './anchor-manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuoteDto, DepositDto, WithdrawDto } from './dto/anchor.dto';

@Controller('anchors')
export class AnchorController {
  constructor(private readonly anchorManager: AnchorManagerService) {}

  @Get('quote')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getQuote(@Query() query: QuoteDto) {
    return this.anchorManager.getBestQuote(query.from, query.to, query.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async deposit(@Body() data: DepositDto) {
    const adapter = this.anchorManager.getAdapter(data.anchor);
    return adapter.initiateDeposit(data.userId, data.amount, data.asset);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async withdraw(@Body() data: WithdrawDto) {
    const adapter = this.anchorManager.getAdapter(data.anchor);
    return adapter.initiateWithdrawal(data.userId, data.amount, data.asset, data.destination);
  }
}
