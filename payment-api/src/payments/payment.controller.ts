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

  /**
   * POST /payments/transfer
   * Initiate a direct Stellar payment to the authenticated merchant's wallet.
   * Body: { amount: number, asset: string, assetIssuer?: string }
   */
  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(
    @Request() req,
    @Body() data: { amount: number; asset: string; assetIssuer?: string },
  ) {
    // The system wallet sends `amount` to the merchant's wallet address
    return this.paymentService.initiateStellarTransfer(
      req.user.userId,     // merchantId
      req.user.userId,     // customerId (same actor in this flow; override via body if needed)
      data.amount,
      data.asset,
      data.assetIssuer,
    );
  }

  /**
   * POST /payments/escrow
   * Create a Soroban escrow payment.
   * Body: { senderAddress: string, tokenAddress: string, amount: number }
   */
  @UseGuards(JwtAuthGuard)
  @Post('escrow')
  async escrow(
    @Request() req,
    @Body() data: { senderAddress: string; tokenAddress: string; amount: number },
  ) {
    return this.paymentService.createEscrowPayment(
      data.senderAddress,
      req.user.userId,
      data.tokenAddress,
      data.amount,
    );
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
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.paymentService.updateTransactionStatus(id, status);
  }
}
