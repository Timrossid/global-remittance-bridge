const { Horizon } = require('@stellar/stellar-sdk');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
require('dotenv').config();

const prisma = new PrismaClient();

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const HORIZON_URL =
  STELLAR_NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

const server = new Horizon.Server(HORIZON_URL);

console.log(`Transaction Indexer starting on ${STELLAR_NETWORK} (${HORIZON_URL})`);

/**
 * Watches for new payments on a given merchant address and syncs them to the DB.
 * @param {string} merchantId
 * @param {string} merchantAddress
 */
async function watchTransactions(merchantId, merchantAddress) {
  try {
    const payments = await server.payments().forAccount(merchantAddress).order('desc').limit(50).call();

    for (const payment of payments.records) {
      // Only handle payment operations
      if (payment.type !== 'payment' && payment.type !== 'create_account') continue;

      const txHash = payment.transaction_hash;

      // Check if already indexed
      const existing = await prisma.transaction.findUnique({
        where: { stellarTxHash: txHash },
      });

      if (!existing) {
        const txDetails = await payment.transaction();
        const memo = txDetails.memo;

        console.log(`[${merchantAddress.slice(0, 8)}] New payment: ${txHash} | memo: ${memo || 'none'}`);

        // If memo matches an internal transaction ID, update its status
        if (memo) {
          const internalTx = await prisma.transaction.findUnique({ where: { id: memo } }).catch(() => null);
          if (internalTx) {
            await prisma.transaction.update({
              where: { id: memo },
              data: {
                stellarTxHash: txHash,
                status: 'COMPLETED',
              },
            });
            console.log(`  ✓ Linked to internal tx ${memo} → COMPLETED`);
            continue;
          }
        }

        // Otherwise, create a new transaction record from the on-chain data
        const amount =
          payment.type === 'create_account' ? payment.starting_balance : payment.amount;
        const currency =
          payment.type === 'create_account'
            ? 'XLM'
            : payment.asset_type === 'native'
            ? 'XLM'
            : payment.asset_code;

        // Look up or create a minimal customer record for the sender
        const senderAddress = payment.from || payment.funder;
        let customer = await prisma.customer.findUnique({
          where: { walletAddress: senderAddress },
        });
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              email: `${senderAddress.slice(0, 10).toLowerCase()}@stellar.network`,
              walletAddress: senderAddress,
              kycStatus: 'PENDING',
            },
          });
        }

        await prisma.transaction.create({
          data: {
            amount: parseFloat(amount),
            currency,
            merchantId,
            customerId: customer.id,
            senderId: senderAddress,
            receiverId: merchantAddress,
            status: 'COMPLETED',
            stellarTxHash: txHash,
          },
        });
        console.log(`  ✓ Created new transaction record for ${txHash}`);
      }
    }
  } catch (error) {
    if (error?.response?.status === 404) {
      console.warn(`[${merchantAddress.slice(0, 8)}] Account not found on Stellar — skipping`);
    } else {
      console.error(`Error indexing ${merchantAddress.slice(0, 8)}:`, error.message);
    }
  }
}

/**
 * Run one full indexing cycle across all active merchants.
 */
async function runIndexingCycle() {
  try {
    const merchants = await prisma.merchant.findMany({
      select: { id: true, walletAddress: true, name: true },
    });

    if (merchants.length === 0) {
      console.log('No merchants registered yet — waiting...');
      return;
    }

    console.log(`\n[${new Date().toISOString()}] Indexing ${merchants.length} merchant(s)...`);

    for (const merchant of merchants) {
      await watchTransactions(merchant.id, merchant.walletAddress);
    }

    console.log('Indexing cycle complete.');
  } catch (err) {
    console.error('Indexing cycle error:', err.message);
  }
}

// Run immediately on startup
runIndexingCycle();

// Then run every 30 seconds via node-cron
cron.schedule('*/30 * * * * *', () => {
  runIndexingCycle();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down');
  await prisma.$disconnect();
  process.exit(0);
});
