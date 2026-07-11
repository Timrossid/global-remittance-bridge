import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './common/prisma.service';

async function runTests() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const prisma = moduleFixture.get<PrismaService>(PrismaService);

  console.log('🚀 Starting Backend Integration Tests...');

  try {
    // Cleanup
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.merchant.deleteMany();

    // 1. Create Customer
    console.log('Creating Customer...');
    const customer = await prisma.customer.create({
      data: {
        email: `cust_${Date.now()}@example.com`,
        walletAddress: 'GD_CUST',
        kycStatus: 'VERIFIED',
      }
    });

    // 2. Test Merchant Onboarding
    console.log('Testing Merchant Onboarding...');
    const onboardRes = await request(app.getHttpServer())
      .post('/merchants/onboard')
      .send({
        name: 'Test Merchant Ltd',
        email: `merchant_${Date.now()}@example.com`,
        walletAddress: 'GD_MERCH',
      });
    
    if (onboardRes.status !== 201) throw new Error(`Onboarding failed: ${onboardRes.status}`);
    const merchant = onboardRes.body;
    console.log('✅ Merchant onboarded successfully:', merchant.id);

    // 3. Test Payment Creation
    console.log('Testing Payment Creation...');
    const paymentRes = await request(app.getHttpServer())
      .post('/payments/create')
      .send({
        amount: 100.0,
        currency: 'USD',
        senderId: customer.id,
        receiverId: merchant.id,
        merchantId: merchant.id,
        customerId: customer.id,
        status: 'PENDING'
      });

    if (paymentRes.status !== 201) throw new Error(`Payment creation failed: ${paymentRes.status}`);
    const payment = paymentRes.body;
    console.log('✅ Payment created successfully:', payment.id);

    // 4. Test Payment Status Update
    console.log('Testing Payment Status Update...');
    const updateRes = await request(app.getHttpServer())
      .put(`/payments/${payment.id}/status`)
      .send({ status: 'COMPLETED' });

    if (updateRes.status !== 200) throw new Error(`Status update failed: ${updateRes.status}`);
    console.log('✅ Payment status updated to COMPLETED');

    // 5. Verify in DB
    const dbPayment = await prisma.transaction.findUnique({ where: { id: payment.id } });
    if (dbPayment?.status !== 'COMPLETED') throw new Error('DB state not updated');
    console.log('✅ DB Verification: SUCCESS');

    console.log('\n🌟 ALL BACKEND TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runTests();
