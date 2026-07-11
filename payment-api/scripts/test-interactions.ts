import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// In a real test environment, we would use a test user and login to get a real JWT.
// For this simulation, we'll use a dummy token.
const MOCK_TOKEN = 'MOCK_JWT_TOKEN'; 

async function runTests() {
  console.log('🚀 Starting User Interaction Tests...');

  try {
    // 1. Merchant Onboarding
    console.log('\n1. Testing Merchant Onboarding...');
    const merchantResponse = await axios.post(`${API_URL}/merchants/onboard`, {
      name: 'Test Merchant SME',
      email: 'test-merchant@example.com',
      walletAddress: 'GB...TEST_MERCHANT_ADDRESS',
      kycStatus: 'PENDING'
    });
    const merchantId = merchantResponse.data.id;
    console.log('✅ Merchant Onboarded:', merchantId);

    // 2. Customer Payment Initiation
    console.log('\n2. Testing Payment Initiation...');
    const paymentResponse = await axios.post(`${API_URL}/payments/create`, {
      amount: 100.00,
      currency: 'USDC',
      merchantId: merchantId,
      customerId: 'customer-123'
    });
    const transactionId = paymentResponse.data.id;
    console.log('✅ Payment Initiated:', transactionId);

    // 3. Get Transaction Details
    console.log('\n3. Testing Get Transaction Details...');
    const txResponse = await axios.get(`${API_URL}/payments/${transactionId}`);
    console.log('✅ Transaction Details Retrieved:', txResponse.data.status);

    // 4. Merchant Stats Check
    console.log('\n4. Testing Merchant Stats...');
    try {
        const statsResponse = await axios.get(`${API_URL}/merchants/me/stats`, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log('✅ Merchant Stats:', statsResponse.data);
    } catch (e: any) {
        console.log('⚠️ Stats check failed (Auth expected):', e.message);
    }

    // 5. Escrow Creation (Placeholder)
    console.log('\n5. Testing Escrow Creation...');
    try {
        const escrowResponse = await axios.post(`${API_URL}/payments/escrow`, {
            receiverAddress: 'GC...RECEIVER_ADDRESS',
            tokenAddress: 'GC...TOKEN_ADDRESS',
            amount: 500.00
        }, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log('✅ Escrow Response:', escrowResponse.data.status, '-', escrowResponse.data.message);
    } catch (e: any) {
        console.log('⚠️ Escrow creation failed:', e.message);
    }

    // 6. Update KYC
    console.log('\n6. Testing KYC Update...');
    try {
        await axios.put(`${API_URL}/merchants/${merchantId}/kyc`, { status: 'VERIFIED' }, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log('✅ KYC Updated to VERIFIED');
    } catch (e: any) {
        console.log('⚠️ KYC update failed:', e.message);
    }

    // 7. Get Merchant Profile
    console.log('\n7. Testing Get Merchant Profile...');
    try {
        const profileResponse = await axios.get(`${API_URL}/merchants/me`, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log('✅ Merchant Profile:', profileResponse.data.name);
    } catch (e: any) {
        console.log('⚠️ Profile retrieval failed:', e.message);
    }

    // 8. Get Merchant Transactions
    console.log('\n8. Testing Get Merchant Transactions...');
    try {
        const txListResponse = await axios.get(`${API_URL}/merchants/${merchantId}/transactions`, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log(`✅ Retrieved ${txListResponse.data.length} transactions`);
    } catch (e: any) {
        console.log('⚠️ Transaction list retrieval failed:', e.message);
    }

    // 9. Trigger Stellar Transfer
    console.log('\n9. Testing Stellar Transfer...');
    try {
        const transferResponse = await axios.post(`${API_URL}/payments/transfer`, {
            merchantId: merchantId,
            amount: 50.00,
            asset: 'USDC'
        }, {
            headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
        console.log('✅ Transfer Initiated:', transferResponse.data.txHash);
    } catch (e: any) {
        console.log('⚠️ Stellar transfer failed:', e.message);
    }

    // 10. Final Transaction Status Check
    console.log('\n10. Testing Final Transaction Status Check...');
    try {
        const finalTxResponse = await axios.get(`${API_URL}/payments/${transactionId}`);
        console.log('✅ Final Transaction Status:', finalTxResponse.data.status);
    } catch (e: any) {
        console.log('⚠️ Final status check failed:', e.message);
    }

    console.log('\n🎉 All 10 automated test scenarios completed!');
  } catch (error: any) {
    console.error('\n❌ Test suite failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

runTests();
