import { EscrowHelper } from '../src/escrow-helper';

describe('EscrowHelper', () => {
  it('builds escrow payload with contract ID and RPC URL', () => {
    const helper = new EscrowHelper('CCESCROW', 'https://soroban-testnet.stellar.org');
    const payload = helper.buildCreateEscrowTx({ sender: 'GSRC', receiver: 'GREC', token: 'CTOKEN', amountStroops: '5000000' });
    expect(payload.contractId).toBe('CCESCROW');
    expect(payload.sender).toBe('GSRC');
    expect(payload.amountStroops).toBe('5000000');
  });

  it('preserves the RPC URL in payload', () => {
    const helper = new EscrowHelper('CC', 'https://soroban-testnet.stellar.org');
    const payload = helper.buildCreateEscrowTx({ sender: 'GSRC', receiver: 'GREC', token: 'CTOKEN', amountStroops: '1' });
    expect(payload.rpcUrl).toBe('https://soroban-testnet.stellar.org');
  });
});
