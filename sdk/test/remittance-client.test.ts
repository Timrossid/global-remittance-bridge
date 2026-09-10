import { RemittanceClient } from '../src/client';

describe('RemittanceClient', () => {
  const client = new RemittanceClient({ apiUrl: 'https://api.example.com', apiKey: 'test-key' });

  it('fetches merchant with Bearer header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'm1', name: 'Acme' }) });
    global.fetch = mockFetch as any;
    const result = await client.getMerchant('m1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/merchants/m1',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }),
    );
    expect(result.id).toBe('m1');
  });

  it('fetches transactions list', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    global.fetch = mockFetch as any;
    const result = await client.getTransactions('m1');
    expect(result).toEqual([]);
  });
});
