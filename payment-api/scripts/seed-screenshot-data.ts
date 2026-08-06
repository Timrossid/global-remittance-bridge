import { PrismaClient, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

const MERCHANT_ID = '2f5cf944-aa1e-4bb0-aa46-25500bf3b515';

const CUSTOMERS = [
  { id: 'cust-001', email: 'alice@stellar.test', walletAddress: 'GALICE1111111111111111111111111111111111' },
  { id: 'cust-002', email: 'bob@stellar.test', walletAddress: 'GBOBB2222222222222222222222222222222222' },
  { id: 'cust-003', email: 'carol@stellar.test', walletAddress: 'GCARO3333333333333333333333333333333333' },
  { id: 'cust-004', email: 'dave@stellar.test', walletAddress: 'GDAVE4444444444444444444444444444444444' },
  { id: 'cust-005', email: 'eve@stellar.test', walletAddress: 'GEEVE5555555555555555555555555555555555' },
];

const TRANSACTIONS: Array<{
  amount: number;
  currency: string;
  status: TransactionStatus;
  stellarTxHash: string;
  senderId: string;
  receiverId: string;
}> = [
  { amount: 120.50, currency: 'XLM', status: TransactionStatus.COMPLETED, stellarTxHash: '53c5c09e7153e5fc731b8a917e157fd2c09ca5b79fbc51ffb4fc6cfddf163426', senderId: CUSTOMERS[0].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 250.00, currency: 'USDC', status: TransactionStatus.COMPLETED, stellarTxHash: 'af8158e1e7be457ab87ab23460f05071fbf4ccf182e3a4c4d17171b5b8fe2c5f', senderId: CUSTOMERS[1].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 75.25, currency: 'XLM', status: TransactionStatus.PENDING, stellarTxHash: 'dff23f47977479a8d96d9de8bc7e527e2071f8839b5c22442b1aa7e116e13581', senderId: CUSTOMERS[2].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 500.00, currency: 'USDC', status: TransactionStatus.COMPLETED, stellarTxHash: '260ff05051ae5a9e59b33a526d84c8fcf28d5658fe8e3fedaa5df998b5adc161', senderId: CUSTOMERS[3].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 32.10, currency: 'XLM', status: TransactionStatus.COMPLETED, stellarTxHash: 'be47b1a2aecbf7f15a6d8cc8b8b23b36e14d6036cf3c63ffef039d17e99dc2c6', senderId: CUSTOMERS[4].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 180.00, currency: 'USDC', status: TransactionStatus.FAILED, stellarTxHash: '0bdf0bb69e664b298e5fda67e59859bc563685c2185c23a4ca03efd608d56719', senderId: CUSTOMERS[0].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 95.75, currency: 'XLM', status: TransactionStatus.COMPLETED, stellarTxHash: '9ba671b92d912bfdf65ce029c9026c661711172405daa6ea1b6ce13d92565070', senderId: CUSTOMERS[1].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 410.20, currency: 'USDC', status: TransactionStatus.PENDING, stellarTxHash: 'e0fa25f207bdb5bc9c9250abee7bcea3ec75a22ea71f9d6587c00488bae038b6', senderId: CUSTOMERS[2].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 60.00, currency: 'XLM', status: TransactionStatus.COMPLETED, stellarTxHash: 'c2cb78b8cdbab537d638cb2bdca9bffcbc4ffe4a2685164d8ffac4aaa98c9d46', senderId: CUSTOMERS[3].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 220.80, currency: 'USDC', status: TransactionStatus.COMPLETED, stellarTxHash: '718574825c5432afab71c1ce5f98ebf3cf605ab0359d2c585f5e24baefadf1db', senderId: CUSTOMERS[4].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 150.00, currency: 'XLM', status: TransactionStatus.CANCELLED, stellarTxHash: '7579a384cc3a171c6f445af243289b966c5c4d3c29fe9aec5358a34432e7d015', senderId: CUSTOMERS[0].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
  { amount: 85.50, currency: 'USDC', status: TransactionStatus.COMPLETED, stellarTxHash: '52ed4b5a41b9a7ae4cfe6fe71c6a17362e65b8ddd44e3660999658c41ad9ac80', senderId: CUSTOMERS[1].walletAddress, receiverId: 'GDEMOMERCHANT11111111111111111111111' },
];

async function main() {
  console.log('Seeding customers...');
  for (const c of CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`Seeded ${CUSTOMERS.length} customers.`);

  console.log('Seeding transactions for merchant', MERCHANT_ID);
  for (const tx of TRANSACTIONS) {
    await prisma.transaction.create({
      data: {
        ...tx,
        merchant: { connect: { id: MERCHANT_ID } },
        customer: {
          connect: {
            id: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)].id,
          },
        },
      },
    });
  }
  console.log(`Seeded ${TRANSACTIONS.length} transactions.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
