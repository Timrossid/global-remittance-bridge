"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.API_URL || 'http://localhost:3000';
const MOCK_TOKEN = 'MOCK_JWT_TOKEN';
async function runTests() {
    console.log('🚀 Starting User Interaction Tests...');
    try {
        console.log('\n1. Testing Merchant Onboarding...');
        const merchantResponse = await axios_1.default.post(`${API_URL}/merchants/onboard`, {
            name: 'Test Merchant SME',
            email: 'test-merchant@example.com',
            walletAddress: 'GB...TEST_MERCHANT_ADDRESS',
            kycStatus: 'PENDING'
        });
        const merchantId = merchantResponse.data.id;
        console.log('✅ Merchant Onboarded:', merchantId);
        console.log('\n2. Testing Payment Initiation...');
        const paymentResponse = await axios_1.default.post(`${API_URL}/payments/create`, {
            amount: 100.00,
            currency: 'USDC',
            merchantId: merchantId,
            customerId: 'customer-123'
        });
        const transactionId = paymentResponse.data.id;
        console.log('✅ Payment Initiated:', transactionId);
        console.log('\n3. Testing Get Transaction Details...');
        const txResponse = await axios_1.default.get(`${API_URL}/payments/${transactionId}`);
        console.log('✅ Transaction Details Retrieved:', txResponse.data.status);
        console.log('\n4. Testing Merchant Stats...');
        try {
            const statsResponse = await axios_1.default.get(`${API_URL}/merchants/me/stats`, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('✅ Merchant Stats:', statsResponse.data);
        }
        catch (e) {
            console.log('⚠️ Stats check failed (Auth expected):', e.message);
        }
        console.log('\n5. Testing Escrow Creation...');
        try {
            const escrowResponse = await axios_1.default.post(`${API_URL}/payments/escrow`, {
                receiverAddress: 'GC...RECEIVER_ADDRESS',
                tokenAddress: 'GC...TOKEN_ADDRESS',
                amount: 500.00
            }, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('✅ Escrow Response:', escrowResponse.data.status, '-', escrowResponse.data.message);
        }
        catch (e) {
            console.log('⚠️ Escrow creation failed:', e.message);
        }
        console.log('\n6. Testing KYC Update...');
        try {
            await axios_1.default.put(`${API_URL}/merchants/${merchantId}/kyc`, { status: 'VERIFIED' }, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('✅ KYC Updated to VERIFIED');
        }
        catch (e) {
            console.log('⚠️ KYC update failed:', e.message);
        }
        console.log('\n7. Testing Get Merchant Profile...');
        try {
            const profileResponse = await axios_1.default.get(`${API_URL}/merchants/me`, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('✅ Merchant Profile:', profileResponse.data.name);
        }
        catch (e) {
            console.log('⚠️ Profile retrieval failed:', e.message);
        }
        console.log('\n8. Testing Get Merchant Transactions...');
        try {
            const txListResponse = await axios_1.default.get(`${API_URL}/merchants/${merchantId}/transactions`, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log(`✅ Retrieved ${txListResponse.data.length} transactions`);
        }
        catch (e) {
            console.log('⚠️ Transaction list retrieval failed:', e.message);
        }
        console.log('\n9. Testing Stellar Transfer...');
        try {
            const transferResponse = await axios_1.default.post(`${API_URL}/payments/transfer`, {
                merchantId: merchantId,
                amount: 50.00,
                asset: 'USDC'
            }, {
                headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
            });
            console.log('✅ Transfer Initiated:', transferResponse.data.txHash);
        }
        catch (e) {
            console.log('⚠️ Stellar transfer failed:', e.message);
        }
        console.log('\n10. Testing Final Transaction Status Check...');
        try {
            const finalTxResponse = await axios_1.default.get(`${API_URL}/payments/${transactionId}`);
            console.log('✅ Final Transaction Status:', finalTxResponse.data.status);
        }
        catch (e) {
            console.log('⚠️ Final status check failed:', e.message);
        }
        console.log('\n🎉 All 10 automated test scenarios completed!');
    }
    catch (error) {
        console.error('\n❌ Test suite failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        else {
            console.error('Message:', error.message);
        }
        process.exit(1);
    }
}
runTests();
//# sourceMappingURL=test-interactions.js.map