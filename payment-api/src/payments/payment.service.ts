import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StellarService } from '../common/stellar.service';
import { NotificationService } from '../notifications/notification.service';
import { SorobanService } from '../common/soroban.service';

/**
 * PaymentService orchestrates Stellar payments and Soroban escrow interactions.
 */
@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stellarService: StellarService,
    private notificationService: NotificationService,
    private sorobanService: SorobanService,
  ) {}

  /**
   * Creates a payment record in the database (initial PENDING state).
   */
  async createPayment(data: {
    amount: number;
    currency: string;
    merchantId: string;
    customerId: string;
    senderId?: string;
    receiverId?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        merchantId: data.merchantId,
        customerId: data.customerId,
        senderId: data.senderId ?? data.customerId,
        receiverId: data.receiverId ?? data.merchantId,
        status: 'PENDING',
      },
    });
  }

  /**
   * Initiates a direct Stellar payment from the server wallet to the merchant's wallet.
   * Used for fiat-to-crypto settlement flows.
   *
   * @param merchantId - UUID of the merchant in our database
   * @param customerId - UUID of the customer initiating the payment
   * @param amount     - Amount to send (e.g. 10.00)
   * @param asset      - Asset code (default: XLM; use USDC with assetIssuer)
   * @param assetIssuer - Issuer G-address for non-native assets
   */
  async initiateStellarTransfer(
    merchantId: string,
    customerId: string,
    amount: number,
    asset: string = 'XLM',
    assetIssuer?: string,
  ) {
    const secret = process.env.STELLAR_SECRET;
    if (!secret) throw new InternalServerErrorException('STELLAR_SECRET is not configured');

    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (!merchant.walletAddress) throw new BadRequestException('Merchant has no wallet address configured');

    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        currency: asset,
        merchantId,
        customerId,
        senderId: customerId,
        receiverId: merchantId,
        status: 'PENDING',
      },
    });

    try {
      const tx = await this.stellarService.buildPaymentTransaction(
        secret,
        merchant.walletAddress,
        amount.toFixed(7),
        asset,
        assetIssuer,
        transaction.id.slice(0, 28), // Stellar memo max 28 bytes
      );

      const txHash = await this.stellarService.submitTransaction(tx);

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { stellarTxHash: txHash, status: 'COMPLETED' },
      });

      await this.notificationService.sendEmail(
        merchant.email,
        'Payment Received',
        `Payment of ${amount} ${asset} received. Transaction hash: ${txHash}`,
      );

      return { txHash, status: 'COMPLETED', transactionId: transaction.id };
    } catch (err: any) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      throw new InternalServerErrorException(`Stellar transfer failed: ${err.message}`);
    }
  }

  /**
   * Creates an escrow via the deployed Soroban escrow contract.
   *
   * Builds an invokeHostFunction operation that calls create_escrow on-chain.
   *
   * @param senderAddress   - Stellar G-address of the customer (sender)
   * @param merchantId      - UUID of the merchant (used to look up their wallet address)
   * @param tokenAddress    - Soroban contract ID of the token (e.g. USDC on testnet)
   * @param amount          - Amount in token stroops (integer, e.g. 10_000_000 for 1 USDC)
   */
  async createEscrowPayment(
    senderAddress: string,
    merchantId: string,
    tokenAddress: string,
    amount: number,
  ) {
    const secret = process.env.STELLAR_SECRET;
    if (!secret) throw new InternalServerErrorException('STELLAR_SECRET is not configured');

    const contractId = process.env.SOROBAN_CONTRACT_ID;
    if (!contractId || contractId === 'CC...') {
      throw new InternalServerErrorException('SOROBAN_CONTRACT_ID is not configured with a real contract address');
    }

    const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    // We use the Soroban RPC simulate+send flow.
    // Build the XDR for an invokeHostFunction call to the escrow contract.
    const StellarSdk = await import('@stellar/stellar-sdk');
    const sourceKeypair = StellarSdk.default.Keypair.fromSecret(secret);
    const sourcePublicKey = sourceKeypair.publicKey();

    const networkPassphrase =
      process.env.STELLAR_NETWORK === 'mainnet'
        ? StellarSdk.default.Networks.PUBLIC
        : StellarSdk.default.Networks.TESTNET;

    const server = new StellarSdk.default.Horizon.Server(
      process.env.STELLAR_NETWORK === 'mainnet'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org',
    );

    const sourceAccount = await server.loadAccount(sourcePublicKey);

    const contract = new StellarSdk.default.Contract(contractId);

    const txBuilder = new StellarSdk.default.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.default.BASE_FEE,
      networkPassphrase,
    }).setTimeout(30);

    // Invoke the create_escrow function on the contract
    const operation = contract.call(
      'create_escrow',
      StellarSdk.default.Address.fromString(senderAddress).toScVal(),
      StellarSdk.default.Address.fromString(merchant.walletAddress).toScVal(),
      StellarSdk.default.Address.fromString(tokenAddress).toScVal(),
      StellarSdk.default.nativeToScVal(BigInt(amount), { type: 'i128' }),
    );

    txBuilder.addOperation(operation);
    const tx = txBuilder.build();

    // Simulate first to get footprint and updated fee
    const simResult = await this.sorobanService.callRPC(rpcUrl, 'simulateTransaction', {
      transaction: tx.toXDR(),
    }) as any;

    if (simResult?.error) {
      throw new InternalServerErrorException(`Soroban simulation failed: ${simResult.error}`);
    }

    // Assemble transaction with simulation results (adds soroban data/auth entries)
    const assembledTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
    assembledTx.sign(sourceKeypair);
    const xdr = assembledTx.toXDR();

    const sendResult = await this.sorobanService.submitTransaction(rpcUrl, xdr);

    // Wait for confirmation
    const confirmation = await this.sorobanService.getTransactionStatus(rpcUrl, sendResult.hash);

    // Store in DB
    const dbTx = await this.prisma.transaction.create({
      data: {
        amount,
        currency: 'USDC',
        merchantId,
        customerId: senderAddress, // Use wallet address as customer reference
        senderId: senderAddress,
        receiverId: merchant.walletAddress,
        status: confirmation.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING',
        stellarTxHash: sendResult.hash,
      },
    });

    return {
      txHash: sendResult.hash,
      status: confirmation.status,
      transactionId: dbTx.id,
    };
  }

  async getTransaction(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async updateTransactionStatus(id: string, status: string) {
    const allowedStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const tx = await this.prisma.transaction.update({
      where: { id },
      data: { status: status as any },
    });

    if (status === 'COMPLETED') {
      const merchant = await this.prisma.merchant.findUnique({ where: { id: tx.merchantId } });
      if (merchant) {
        await this.notificationService.sendWebhook(
          `${process.env.WEBHOOK_BASE_URL || 'https://merchant-webhook.example.com'}/events`,
          { txId: id, status: 'COMPLETED', merchantId: tx.merchantId },
        );
      }
    }

    return tx;
  }

  async getMerchantTransactions(merchantId: string) {
    return this.prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Cap at 100 for performance
    });
  }
}
