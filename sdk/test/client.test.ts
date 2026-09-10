import { RemittanceClient, RemittanceClientConfig, PaymentHelper, EscrowHelper } from '../src';

const mockFetch = global.fetch = jest.fn();

describe('RemittanceClient', () => {
  const config: RemittanceClientConfig = { apiUrl: 'https://api.example.com', apiKey: 'test-key' };
  let client: RemittanceClient;

  beforeEach(() => {
    client = new RemittanceClient(config);
    (mockFetch as jest.Mock).mockClear();
  });

  it('fetches merchant with auth header', async () => {
    (mockFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'm1' }) });
    const result = await client.getMerchant('m1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/merchants/m1',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }),
    );
    expect(result.id).toBe('m1');
  });

  it('fetches transactions list', async () => {
    (mockFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
    const result = await client.getTransactions('m1');
    expect(result).toEqual([]);
  });
});

describe('PaymentHelper', () => {
  it('initiates payment POST to /api/v1/payments/transfer', async () => {
    (mockFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ txHash: 'abc' }) });
    const client = new RemittanceClient({ apiUrl: 'https://api.example.com', apiKey: 'key' });
    const helper = new PaymentHelper(client);
    const result = await helper.initiatePayment({ merchantId: 'm1', customerId: 'c1', amount: 50 });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/payments/transfer',
      expect.objectContaining({ method: 'POST' }),
    );
    expect((result as any).txHash).toBe('abc');
  });
});

describe('EscrowHelper', () => {
  it('builds escrow create payload', () => {
    const helper = new EscrowHelper('CCESCROW', 'https://soroban-testnet.stellar.org');
    const payload = helper.buildCreateEscrowTx({ sender: 'GSRC', receiver: 'GREC', token: 'CTOKEN', amountStroops: '1000000' });
    expect(payload).toEqual({
      contractId: 'CCESCROW',
      sender: 'GSRC',
      receiver: 'GREC',
      token: 'CTOKEN',
      amountStroops: '1000000',
      rpcUrl: 'https://soroban-testnet.stellar.org',
    });
  });
});
