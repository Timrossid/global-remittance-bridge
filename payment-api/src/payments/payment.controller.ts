import { Controller, Post, Get, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async create(@Body() paymentDto: any) {
    return this.paymentService.createPayment(paymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(@Request() req, @Body() data: { amount: number, asset: string }) {
    return this.paymentService.initiateStellarTransfer(req.user.userId, data.amount, data.asset);
  }

  @UseGuards(JwtAuthGuard)
  @Get('merchant/transactions')
  async getMerchantPayments(@Request() req) {
    return this.paymentService.getMerchantTransactions(req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentService.getTransaction(id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') string) {
    return this.paymentService.updateTransactionStatus(id, string);
  }
}
