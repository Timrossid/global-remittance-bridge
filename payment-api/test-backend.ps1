# Test Backend Script (PowerShell)
$process = Start-Process cmd.exe -ArgumentList "/c npm run start:dev" -PassThru -WindowStyle Hidden
Write-Host "Waiting for server to start..."
Start-Sleep -Seconds 25

try {
    # 1. Onboard a Merchant
    Write-Host "Testing Merchant On onboarding..."
    $onboardBody = @{
        name = "Test Merchant"
        email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@merchant.com"
        walletAddress = "GD123"
    } | ConvertTo-Json
    
    $onboardRes = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/merchants/onboard" -ContentType "application/json" -Body $onboardBody
    $merchantId = $onboardRes.id
    Write-Host "✅ Merchant onboarded: $merchantId"

    # 2. Create a Payment
    Write-Host "Testing Payment Creation..."
    $paymentBody = @{
        amount = 100.0
        currency = "USD"
        senderId = "cust_1"
        receiverId = "merch_1"
        merchantId = $merchantId
        customerId = "cust_1"
        status = "PENDING"
    } | ConvertTo-Json
    
    $paymentRes = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/payments/create" -ContentType "application/json" -Body $paymentBody
    $paymentId = $paymentRes.id
    Write-Host "✅ Payment created: $paymentId"

    # 3. Update Payment Status
    Write-Host "Testing Status Update..."
    $updateBody = @{ status = "COMPLETED" } | ConvertTo-Json
    $updateRes = Invoke-RestMethod -Method Put -Uri "http://localhost:3000/payments/$paymentId/status" -ContentType "application/json" -Body $updateBody
    
    if ($updateRes.status -eq "COMPLETED") {
        Write-Host "✅ Status updated successfully"
    } else {
        throw "Status update failed"
    }

    Write-Host "`n🌟 ALL BACKEND TESTS PASSED SUCCESSFULLY! 🌟"
} catch {
    Write-Host "`n❌ TEST FAILED: $_"
    # In case of failure, try to find and kill the node process to avoid hanging
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    exit 1
} finally {
    if ($process) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}
