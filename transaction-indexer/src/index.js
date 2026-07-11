const { Horizon } = require('stellar-sdk');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const server = new Horizon.Server('https://testnet.stellar.org');

/**
 * Watches for new payments on a given merchant address.
 * @param {string} merchantAddress 
 */
async function watchTransactions(merchantAddress) {
  console.log(`Watching transactions for: ${merchantAddress}`);
  
  try {
    const payments = await server.payments().forAccount(merchantAddress).call();
    
    for (const payment of payments.records) {
      const txHash = payment.transaction_hash;
      const memo = payment.memo;
      
      // Check if we've already indexed this transaction
      const existing = await prisma.transaction.findUnique({
        where: { stellarTxHash: txHash }
      });

      if (!existing && memo) {
        console.log(`New transaction detected: ${txHash} with memo: ${memo}`);
        
        // Use the memo as the transaction ID to find and update the transaction
        await prisma.transaction.update({
          where: { id: memo },
          data: { 
            stellarTxHash: txHash,
            status: 'COMPLETED'
          }
        });
        console.log(`Transaction ${memo} updated to COMPLETED`);
      }
    }
  } catch (error) {
    console.error('Error indexing transactions:', error);
  }
}

/**
 * Starts the main indexing loop.
 */
async function startIndexer() {
  console.log('Transaction Indexer Started...');
  
  // In production, we'd fetch all active merchant wallets from DB
  const merchants = await prisma.merchant.findMany();
  
  // Run the watcher in a loop
  while (true) {
    for (const merchant of merchants) {
      await watchTransactions(merchant.walletAddress);
    }
    console.log('Waiting for next polling cycle...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Poll every 30 seconds
  }
}

startIndexer()
  .then(() => console.log('Indexing cycle complete.'))
  .catch(err => console.error('Indexer Error:', err))
  .finally(async () => {
    await prisma.$disconnect();
  });
