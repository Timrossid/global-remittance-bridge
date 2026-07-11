import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying database connection and schema...');
  
  try {
    // Test connection and basic counts
    const merchants = await prisma.merchant.count();
    const customers = await prisma.customer.count();
    const transactions = await prisma.transaction.count();
    
    console.log('✅ Database Connection: SUCCESS');
    console.log('-----------------------------------');
    console.log(`Merchants: ${merchants}`);
    console.log(`Customers: ${customers}`);
    console.log(`Transactions: ${transactions}`);
    console.log('-----------------------------------');
    console.log('🚀 Database is ready for production!');
  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
