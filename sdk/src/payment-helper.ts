import { RemittanceClient, RemittanceClientConfig } from './client';

export interface PaymentInput {
  merchantId: string;
  customerId: string;
  amount: number;
  asset?: string;
}

export class PaymentHelper {
  constructor(private readonly client: RemittanceClient) {}

  async initiatePayment(input: PaymentInput): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.client['config'].apiUrl}/api/v1/payments/transfer`, {
      method: 'POST',
      headers: this.client['config'].apiKey
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${this.client['config'].apiKey}` }
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: input.amount,
        asset: input.asset || 'XLM',
        merchantId: input.merchantId,
        customerId: input.customerId,
      }),
    });
    if (!res.ok) throw new Error(`Payment failed: ${res.status}`);
    return res.json();
  }
}
