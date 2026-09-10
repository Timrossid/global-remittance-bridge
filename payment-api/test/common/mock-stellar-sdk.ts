const mockStellarSdk = {
  default: {
    Keypair: {
      fromSecret: () => ({ publicKey: () => 'GSOURCE' }),
    },
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
    Horizon: {
      Server: class {
        loadAccount() { return Promise.resolve({}); }
      },
    },
    Contract: class {
      call() { return {}; }
    },
    BASE_FEE: 100,
    Address: {
      fromString: () => ({ toScVal: () => ({}) }),
    },
    nativeToScVal: (val: bigint) => ({ type: 'i128', value: val.toString() }),
    TransactionBuilder: class {
      constructor() {}
      setTimeout() { return this; }
      addOperation() { return this; }
      build() { return {}; }
    },
    rpc: {
      assembleTransaction: () => ({ build: () => ({}) }),
    },
  },
};

export default mockStellarSdk;
