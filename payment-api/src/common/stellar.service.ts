import { Injectable } from '@nestjs/common';
import StellarSdk from '@stellar/stellar-sdk';

/**
 * StellarService wraps the Stellar Horizon SDK for account lookups,
 * building payment transactions, and submitting them to the network.
 */
@Injectable()
export class StellarService {
  private readonly networkPassphrase: string;
  private server: StellarSdk.Horizon.Server;

  constructor() {
    const network = process.env.STELLAR_NETWORK || 'testnet';
    if (network === 'mainnet' || network === 'public') {
      this.networkPassphrase = StellarSdk.Networks.PUBLIC;
      this.server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
    } else {
      this.networkPassphrase = StellarSdk.Networks.TESTNET;
      this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    }
  }

  /**
   * Fetches account details from Horizon (balance, sequence number, etc.)
   */
  async getAccountInfo(accountId: string) {
    try {
      return await this.server.loadAccount(accountId);
    } catch (error: any) {
      throw new Error(`Failed to fetch account info for ${accountId}: ${error.message}`);
    }
  }

  /**
   * Builds and signs a Stellar payment transaction.
   *
   * @param sourceSecret   - Source account secret key (S...)
   * @param destinationId  - Destination account public key (G...)
   * @param amount         - Amount as string (e.g. "10.00")
   * @param assetCode      - Asset code, e.g. "USDC" or "native" for XLM
   * @param assetIssuer    - Asset issuer G-address; ignored for native XLM
   * @param memo           - Optional text memo (e.g. internal transaction ID)
   */
  async buildPaymentTransaction(
    sourceSecret: string,
    destinationId: string,
    amount: string,
    assetCode: string = 'XLM',
    assetIssuer?: string,
    memo?: string,
  ): Promise<StellarSdk.Transaction> {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Load the source account to get the current sequence number
    const sourceAccount = await this.server.loadAccount(sourcePublicKey);

    // Determine the asset to send
    let asset: StellarSdk.Asset;
    if (assetCode.toUpperCase() === 'XLM' || assetCode.toLowerCase() === 'native') {
      asset = StellarSdk.Asset.native();
    } else {
      if (!assetIssuer) {
        throw new Error(`Asset issuer is required for non-native asset "${assetCode}"`);
      }
      asset = new StellarSdk.Asset(assetCode, assetIssuer);
    }

    const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationId,
          asset,
          amount,
        }),
      )
      .setTimeout(30);

    if (memo) {
      builder.addMemo(StellarSdk.Memo.text(memo.slice(0, 28))); // Stellar memo max 28 bytes
    }

    const transaction = builder.build();
    transaction.sign(sourceKeypair);
    return transaction;
  }

  /**
   * Submits a signed transaction to Horizon.
   * Returns the transaction hash on success.
   */
  async submitTransaction(transaction: StellarSdk.Transaction): Promise<string> {
    try {
      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error: any) {
      const detail = error?.response?.data?.extras?.result_codes ?? error.message;
      throw new Error(`Transaction submission failed: ${JSON.stringify(detail)}`);
    }
  }

  /**
   * Friendbot funds a testnet account with XLM (only works on testnet).
   */
  async fundTestnetAccount(publicKey: string): Promise<void> {
    if (this.networkPassphrase !== StellarSdk.Networks.TESTNET) {
      throw new Error('Friendbot is only available on testnet');
    }
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
    );
    if (!response.ok) {
      throw new Error(`Friendbot failed: ${response.statusText}`);
    }
  }
}
