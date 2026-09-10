import { PaymentHelper } from '../src/payment-helper';
import { RemittanceClient } from '../src/client';

describe('PaymentHelper', () => {
  const client = { get: vi.fn() } as any;
  const helper = new PaymentHelper(client as unknown as RemittanceClient);

  it('throws on non-OK response', async () => {
    client['config'] = { apiUrl: 'https://api.example.com' };
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as any;
    await expect(helper.initiatePayment({ merchantId: 'm1', customerId: 'c1', amount: 50 })).rejects.toThrow('Payment failed');
  });

  it('sends POST with amount, asset, merchantId, customerId', async () => {
    client['config'] = { apiUrl: 'https://api.example.com', apiKey: 'key' };
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ txHash: 'abc' }) });
    global.fetch = mockFetch as any;
    await helper.initiatePayment({ merchantId: 'm1', customerId: 'c1', amount: 50, asset: 'USDC' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/payments/transfer',
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('USDC') }),
    );
  });
});
