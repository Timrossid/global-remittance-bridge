import { Injectable } from '@nestjs/common';
import StellarSdk from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private server = new StellarSdk.Horizon.Server('https://testnet.stellar.org');

  async getAccountInfo(accountId: string) {
    try {
      return await this.server.accounts().accountId(accountId).call();
    } catch (error: any) {
      throw new Error(`Failed to fetch account info for ${accountId}: ${error.message}`);
    }
  }

  async buildPaymentTransaction(sourceSecret: string, destinationId: string, amount: string, assetCode: string = 'USDC', memo?: string) {
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourceAccountId = sourceKeypair.publicKey();

      const transaction = new StellarSdk.TransactionBuilder(sourceAccountId as any, { fee: StellarSdk.BASE_FEE })
        .addOperation(StellarSdk.Operation.payment({
          sourceAccount: sourceAccountId,
          destinationAccount: destinationId,
          asset: new StellarSdk.Asset(assetCode, ''),
          amount: amount
        } as any))
        .build();

      if (memo) {
        (transaction as any).memo = memo;
      }

      transaction.sign(sourceKeypair);
      return transaction;
    } catch (error: any) {
      throw new Error(`Failed to build transaction: ${error.message}`);
    }
  }

  async submitTransaction(transaction: any) {
    try {
      return await this.server.submitTransaction(transaction);
    } catch (error: any) {
      throw new Error(`Transaction submission failed: ${error.message}`);
    }
  }
}
