# Test Backend Script
# Start the server in the background
npm run start:dev & 
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 15

# 1. Onboard a Merchant
echo "Testing Merchant Onboarding..."
MERCHANT_RESPONSE=$(curl -s -X POST http://localhost:3000/merchants/onboard \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Merchant\", \"email\": \"test@merchant.com\", \"walletAddress\": \"GD123\"}")
echo "Response: $MERCHANT_RESPONSE"
MERCHANT_ID=$(echo $MERCHANT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$MERCHANT_ID" ]; then
  echo "❌ Merchant onboarding failed"
  kill $SERVER_PID
  exit 1
fi
echo "✅ Merchant onboarded: $MERCHANT_ID"

# 2. Create a Payment
echo "Testing Payment Creation..."
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3000/payments/create \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 100, \"currency\": \"USD\", \"senderId\": \"cust_1\", \"receiverId\": \"merch_1\", \"merchantId\": \"$MERCHANT_ID\", \"customerId\": \"cust_1\", \"status\": \"PENDING\"}")
echo "Response: $PAYMENT_RESPONSE"
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_ID" ]; then
  echo "❌ Payment creation failed"
  kill $SERVER_PID
  exit 1
fi
echo "✅ Payment created: $PAYMENT_ID"

# 3. Update Payment Status
echo "Testing Status Update..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3000/payments/$PAYMENT_ID/status \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"COMPLETED\"}")
echo "Response: $UPDATE_RESPONSE"

if [[ $UPDATE_RESPONSE == *"COMPLETED"* ]]; then
  echo "✅ Status updated successfully"
else
  echo "❌ Status update failed"
  kill $SERVER_PID
  exit 1
fi

echo "🌟 ALL BACKEND TESTS PASSED! 🌟"
kill $SERVER_PID
