# Anchor Adapter

Adapter pattern for fiat on/off-ramp providers (Circle, MoneyGram, etc.).

## Structure

| Path | Purpose |
|------|---------|
| `src/shared/` | Common interfaces (AnchorAdapter, PayoutRequest, DepositRequest) |
| `src/circle/` | Circle adapter (mock) |
| `src/moneygram/` | MoneyGram adapter (placeholder) |

## Usage

```ts
import { CircleAdapter } from './src/circle';

const adapter = new CircleAdapter({ apiKey: process.env.CIRCLE_API_KEY });
const result = await adapter.initiatePayout({ amount: 100, currency: 'USD', destination: '...' });
```

## Adding a new adapter

1. Create a new directory under `src/<provider>/`
2. Implement the `AnchorAdapter` interface from `src/shared/`
3. Register the adapter in the payment-api `AnchorModule`
EOF