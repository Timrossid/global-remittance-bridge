import { Horizon } from '@stellar/stellar-sdk';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const HORIZON_URL =
  STELLAR_NETWORK === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

const server = new Horizon.Server(HORIZON_URL);

const INDEXER_TAG = 'transaction-indexer';

type IndexerError = {
  message: string;
  merchantId?: string;
  timestamp: string;
  recoverable: boolean;
};

const errorLog: IndexerError[] = [];

function logIndexerError(error: IndexerError) {
  errorLog.push(error);
  if (errorLog.length > 200) errorLog.shift();
  console.error(`[${INDEXER_TAG}] ${error.timestamp} merchant=${error.merchantId ?? 'global'} recoverable=${error.recoverable} ${error.message}`);
}

/**
 * Returns the most recent recorded stellar_tx_hash for a merchant so the
 * indexer can page forward instead of re-scanning the entire history.
 */
async function getCursor(merchantId: string): Promise<string | null> {
  const row = await prisma.$queryRaw<{ lastHash: string | null }[]>`
    SELECT MAX("stellarTxHash") AS "lastHash"
    FROM "Transaction"
    WHERE "merchantId" = ${merchantId}
      AND "stellarTxHash" IS NOT NULL
  `;
  return row[0]?.lastHash ?? null;
}

async function watchTransactions(merchantId: string, merchantAddress: string) {
  try {
    const cursor = await getCursor(merchantId);
    let paymentsCursor = cursor ? { cursor } : undefined;

    const payments = await server
      .payments()
      .forAccount(merchantAddress)
      .order('desc')
      .limit(50);

    if (paymentsCursor && 'cursor' in paymentsCursor) {
      (payments as any).cursor(pursor);
    }

    const records = await payments.call();

    for (const payment of records.records) {
      if (payment.type !== 'payment' && payment.type !== 'create_account') continue;

      const txHash = payment.transaction_hash;

      const existing = await prisma.transaction.findUnique({
        where: { stellarTxHash: txHash },
      });

      if (existing) continue;

      const memo = payment.transaction_memo;

      if (memo) {
        const internalTx = await prisma.transaction.findUnique({ where: { id: memo } }).catch(() => null);
        if (internalTx) {
          await prisma.transaction.update({
            where: { id: memo },
            data: { stellarTxHash: txHash, status: 'COMPLETED' },
          });
          console.log(`[${INDEXER_TAG}] Linked ${txHash.slice(0, 8)} → internal tx ${memo}`);
          continue;
        }
      }

      const amount =
        payment.type === 'create_account' ? payment.starting_balance : payment.amount;
      const currency =
        payment.type === 'create_account'
          ? 'XLM'
          : payment.asset_type === 'native'
            ? 'XLM'
            : payment.asset_code;

      const senderAddress = payment.from || payment.funder;

      let customer = await prisma.customer.findUnique({
        where: { walletAddress: senderAddress },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            email: `idx-${senderAddress.slice(0, 8).toLowerCase()}@stellar.network`,
            walletAddress: senderAddress,
            kycStatus: 'PENDING',
          },
        });
      }

      await prisma.transaction.create({
        data: {
          amount: parseFloat(amount),
          currency: currency || 'XLM',
          merchantId,
          customerId: customer.id,
          senderId: senderAddress,
          receiverId: merchantAddress,
          status: 'COMPLETED',
          stellarTxHash: txHash,
        },
      });

      console.log(`[${INDEXER_TAG}] Indexed ${txHash.slice(0, 12)}…`);
    }
  } catch (error) {
    const err = error as any;
    if (err?.response?.status === 404 || err?.status === 404) {
      logIndexerError({
        message: `Account not found on Horizon — ${merchantAddress}`,
        merchantId,
        timestamp: new Date().toISOString(),
        recoverable: false,
      });
    } else if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT' || err?.code === 'ENOTFOUND') {
      logIndexerError({
        message: `Network error indexing merchant ${merchantId}: ${err.message}`,
        merchantId,
        timestamp: new Date().toISOString(),
        recoverable: true,
      });
    } else {
      logIndexerError({
        message: `Unexpected indexing error: ${err?.message ?? err}`,
        merchantId,
        timestamp: new Date().toISOString(),
        recoverable: true,
      });
    }
  }
}

async function runIndexingCycle() {
  try {
    const merchants = await prisma.merchant.findMany({
      select: { id: true, walletAddress: true, name: true },
    });

    if (merchants.length === 0) {
      console.log(`[${INDEXER_TAG}] No merchants registered yet — waiting...`);
      return;
    }

    console.log(`[${INDEXER_TAG}] [${new Date().toISOString()}] Indexing ${merchants.length} merchant(s)...`);

    for (const merchant of merchants) {
      await watchTransactions(merchant.id, merchant.walletAddress);
    }

    console.log(`[${INDEXER_TAG}] Indexing cycle complete.`);
  } catch (err) {
    logIndexerError({
      message: `Indexing cycle error: ${(err as Error).message}`,
      timestamp: new Date().toISOString(),
      recoverable: true,
    });
  }
}

async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[${INDEXER_TAG}] Health: DB OK`);
  } catch (err) {
    logIndexerError({
      message: `Database health check failed: ${(err as Error).message}`,
      timestamp: new Date().toISOString(),
      recoverable: true,
    });
  }
}

runIndexingCycle();

cron.schedule('*/30 * * * *', () => {
  runIndexingCycle();
});

cron.schedule('*/5 * * * *', () => {
  healthCheck();
});

async function shutdown(signal: string) {
  console.log(`[${INDEXER_TAG}] ${signal} received — shutting down`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
