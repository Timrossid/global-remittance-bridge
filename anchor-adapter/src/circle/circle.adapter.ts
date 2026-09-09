import { IAnchorAdapter, AnchorQuote, AnchorKycStatus } from '../shared/types';

/**
 * CircleAdapter is a mock/stub implementation of IAnchorAdapter.
 *
 * It returns simulated data for quote, deposit, withdrawal, and KYC checks.
 * Replace the body of each method with real Circle API calls when integrating
 * a live anchor provider. Do not ship mock responses to production merchants.
 */
export class CircleAdapter implements IAnchorAdapter {
  private readonly apiBase = 'https://api.circle.com/v1';

  async getQuote(fromAsset: string, toAsset: string, amount: number): Promise<AnchorQuote> {
    return {
      quoteId: `circle_q_${Math.random().toString(36).substr(2, 9)}`,
      fromAsset,
      toAsset,
      fromAmount: amount,
      toAmount: amount * 0.99,
      fee: amount * 0.01,
      expiresAt: new Date(Date.now() + 3600000),
    };
  }

  async initiateDeposit(userId: string, amount: number, asset: string): Promise<{ depositUrl: string }> {
    return { depositUrl: `https://circle.com/deposit/${userId}/${amount}/${asset}` };
  }

  async initiateWithdrawal(userId: string, amount: number, asset: string, destination: string): Promise<{ txId: string }> {
    return { txId: `circle_tx_${Math.random().toString(36).substr(2, 9)}` };
  }

  async checkKycStatus(userId: string): Promise<AnchorKycStatus> {
    return {
      isVerified: true,
      level: 'FULL',
    };
  }

  async handleWebhook(payload: any): Promise<{ status: string }> {
    console.log('Circle Webhook received:', payload);
    return { status: 'processed' };
  }
}
