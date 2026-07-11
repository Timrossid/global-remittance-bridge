import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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
    // 1. Test Merchant Onboarding
    console.log('Testing Merchant Onboarding...');
    const onboardRes = await request(app.getHttpServer())
      .post('/merchants/onboard')
      .send({
        name: 'Test Merchant Ltd',
        email: `merchant_${Date.now()}@example.com`,
        walletAddress: 'GD...',
      });
    
    if (onboardRes.status !== 201) throw new Error(`Onboarding failed: ${onboardRes.status}`);
    const merchant = onboardRes.body;
    console.log('✅ Merchant onboarded successfully:', merchant.id);

    // 2. Test Payment Creation
    console.log('Testing Payment Creation...');
    const paymentRes = await request(app.getHttpServer())
      .post('/payments/create')
      .send({
        amount: 100.0,
        currency: 'USD',
        senderId: 'cust_123',
        receiverId: 'merch_123',
        merchantId: merchant.id,
        customerId: 'cust_123',
        status: 'PENDING'
      });

    if (paymentRes.status !== 201) throw new Error(`Payment creation failed: ${paymentRes.status}`);
    const payment = paymentRes.body;
    console.log('✅ Payment created successfully:', payment.id);

    // 3. Test Payment Status Update
    console.log('Testing Payment Status Update...');
    const updateRes = await request(app.getHttpServer())
      .put(`/payments/${payment.id}/status`)
      .send({ status: 'COMPLETED' });

    if (updateRes.status !== 200) throw new Error(`Status update failed: ${updateRes.status}`);
    console.log('✅ Payment status updated to COMPLETED');

    // 4. Verify in DB
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
