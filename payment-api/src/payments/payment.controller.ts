import { Controller, Post, Get, Body, Param, Put, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto, TransferDto, EscrowDto, UpdateStatusDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() paymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(paymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async transfer(
    @Request() req,
    @Body() data: TransferDto,
  ) {
    return this.paymentService.initiateStellarTransfer(
      req.user.userId,
      req.user.userId,
      data.amount,
      data.asset,
      data.assetIssuer,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('escrow')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async escrow(
    @Request() req,
    @Body() data: EscrowDto,
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStatus(@Param('id') id: string, @Body() data: UpdateStatusDto) {
    return this.paymentService.updateTransactionStatus(id, data.status);
  }
}
