import { validateEnv } from '../../src/common/validation/env.validation';

describe('env validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when JWT_SECRET is missing', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.JWT_SECRET = '';
    expect(() => validateEnv()).toThrow('JWT_SECRET');
  });

  it('throws when DATABASE_URL is malformed', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'not-a-url';
    expect(() => validateEnv()).toThrow('DATABASE_URL');
  });

  it('returns parsed env when valid', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/db';
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.STELLAR_NETWORK = 'testnet';
    process.env.STELLAR_SECRET = 'S'.repeat(56);
    process.env.SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
    process.env.SOROBAN_CONTRACT_ID = 'CD2YDPGFZCSXY3UAFJSO47GC5S3KDVECPL5SCCQQXIPTEBLDWMYPG44D';
    const result = validateEnv();
    expect(result.JWT_SECRET).toBe('a'.repeat(32));
    expect(result.STELLAR_NETWORK).toBe('testnet');
  });
});
