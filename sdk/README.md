# @global-remittance/sdk

TypeScript SDK for integrating with the Global Micro-Remittance Bridge API.

## Installation

```bash
npm install @global-remittance/sdk
```

## Usage

```ts
import { RemittanceClient, PaymentHelper, EscrowHelper } from '@global-remittance/sdk';

const client = new RemittanceClient({
  apiUrl: 'https://api.bridge.example',
  apiKey: 'your-api-key',
});

const merchant = await client.getMerchant('merchant-uuid');
const transactions = await client.getTransactions('merchant-uuid');

const paymentHelper = new PaymentHelper(client);
const result = await paymentHelper.initiatePayment({
  merchantId: 'merchant-uuid',
  customerId: 'customer-uuid',
  amount: 100,
  asset: 'USDC',
});

const escrowHelper = new EscrowHelper('CC...escrow', 'https://soroban-testnet.stellar.org');
const escrowTx = escrowHelper.buildCreateEscrowTx({
  sender: 'GSRC...',
  receiver: 'GREC...',
  token: 'CTOKEN...',
  amountStroops: '1000000',
});
```

## License

MIT
