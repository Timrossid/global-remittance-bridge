export interface RemittanceClientConfig {
  apiUrl: string;
  apiKey?: string;
}

export class RemittanceClient {
  constructor(private readonly config: RemittanceClientConfig) {}

  async getMerchant(merchantId: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.config.apiUrl}/api/v1/merchants/${merchantId}`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch merchant: ${res.status}`);
    return res.json();
  }

  async getTransactions(merchantId: string): Promise<Record<string, unknown>[]> {
    const res = await fetch(`${this.config.apiUrl}/api/v1/merchants/${merchantId}/transactions`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
    return res.json();
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}
