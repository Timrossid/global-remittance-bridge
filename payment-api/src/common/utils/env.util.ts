export const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STELLAR_NETWORK',
    'SOROBAN_RPC_URL',
    'SOROBAN_CONTRACT_ID',
    'STELLAR_SECRET',
  ];

  const missing = required.filter(
    (key) => !process.env[key] || process.env[key].trim() === '',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in your deployment platform or .env file before starting the server.',
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (
    process.env.STELLAR_NETWORK !== 'testnet' &&
    process.env.STELLAR_NETWORK !== 'mainnet'
  ) {
    throw new Error(
      `Invalid STELLAR_NETWORK: ${process.env.STELLAR_NETWORK}. Must be 'testnet' or 'mainnet'.`,
    );
  }
};

export const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
};
