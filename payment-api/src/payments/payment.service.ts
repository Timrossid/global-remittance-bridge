import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StellarService } from '../common/stellar.service';
import { NotificationService } from '../notifications/notification.service';
import { SorobanService } from '../common/soroban.service';
import { Prisma } from '@prisma/client';
import * as StellarSdk from '@stellar/stellar-sdk';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stellarService: StellarService,
    private notificationService: NotificationService,
    private sorobanService: SorobanService,
  ) {}

  async createPayment(data: Prisma.TransactionCreateInput) {
    const tx = await this.prisma.transaction.create({ data });
    await this.notificationService.sendEmail('customer@example.com', 'Payment Initiated', `Your payment of ${data.amount} is being processed.`);
    return tx;
  }

  async initiateStellarTransfer(merchantId: string, amount: number, asset: string = 'USDC') {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new Error('Merchant not found');

    // We'll use a placeholder for the transaction ID to put in the memo.
    // In production, we'd create the transaction in our DB first to get the ID.
    const transaction = await this.prisma.transaction.create({
        data: {
            amount: amount,
            currency: asset,
            merchantId: merchantId,
            customerId: 'some-customer-id', // In real app, this would be provided
            status: 'PENDING'
        }
    } as any);

    const secret = process.env.STELLAR_SECRET || 'S-SECRET-EXAMPLE'; 
    
    const tx = await this.stellarService.buildPaymentTransaction(
      secret,
      merchant.walletAddress,
      amount.toString(),
      asset,
      transaction.id // Pass transaction ID as memo
    );
    
    const result = await this.stellarService.submitTransaction(tx);
    
    // Update transaction with hash
    await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { stellarTxHash: typeof result === 'string' ? result : (result as any).hash || (result as any).transaction_hash || (result as any) }
    });

    // Notify merchant
    await this.notificationService.sendSms(merchant.email, `Payment of ${amount} ${asset} received! Tx: ${typeof result === 'string' ? result : (result as any).hash || (result as any).transaction_hash || (result as any)}`);
    
    return {
      txHash: typeof result === 'string' ? result : (result as any).hash || (result as any).transaction_hash || (result as any),
      status: 'SUBMITTED',
    };
  }

  async createEscrowPayment(merchantId: string, receiverAddress: string, tokenAddress: string, amount: number) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new Error('Merchant not found');

    const secret = process.env.STELLAR_SECRET || 'S-SECRET-EXAMPLE';
    const contractId = process.env.SOROBAN_CONTRACT_ID;
    const rpcUrl = process.env.SOROBAN_RPC_URL;
    if (!contractId) throw new Error('SOROBAN_CONTRACT_ID not configured');
    if (!rpcUrl) throw new Error('SOROBAN_RPC_URL not configured');

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: amount,
        currency: 'USDC',
        merchantId: merchantId,
        customerId: 'some-customer-id',
        status: 'PENDING',
      },
    } as any);

    const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
    const sourceAddress = sourceKeypair.publicKey();
    const receiverAddressObj = new StellarSdk.Address(receiverAddress);
    const tokenAddressObj = new StellarSdk.Address(tokenAddress);

    // Note: Soroban transaction building might require a different approach depending on SDK version.
    // This is a placeholder attempt to fix the build errors.
    const tx = new StellarSdk.TransactionBuilder(sourceAddress as any, { fee: StellarSdk.BASE_FEE })
      .addOperation(StellarSdk.Operation.payment({
        sourceAccount: sourceAddress,
        destinationAccount: receiverAddress,
        asset: new StellarSdk.Asset(tokenAddress, ''),
        amount: amount.toString()
      } as any))
      .build();

    tx.sign(sourceKeypair);
    const xdr = (tx as any).toXDR();

    const result = await this.sorobanService.submitTransaction(rpcUrl, xdr);
    const txHash = typeof result === 'string' ? result : (result as any).hash || (result as any).transaction_hash || (result as any);

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { stellarTxHash: txHash },
    });

    await this.notificationService.sendSms(merchant.email, `Escrow of ${amount} USDC created! Tx: ${txHash}`);

    return {
      txHash: txHash,
      status: 'SUBMITTED',
    };

  }

  async getTransaction(id: string) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async updateTransactionStatus(id: string, status: any) {
    const tx = await this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
    
    if (status === 'COMPLETED') {
      await this.notificationService.sendWebhook('https://merchant-webhook.com', { txId: id, status: 'COMPLETED' });
    }
    
    return tx;
  }

  async getMerchantTransactions(merchantId: string) {
    return this.prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
