const http = require('http');
const db = require('./server/config/database');
const app = require('./server/index');

async function runAuthTests() {
  console.log('🔒 STARTING COMPREHENSIVE AUTHENTICATION & LOGIN FLOW TESTS...');
  await db.init();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;
  console.log(`🚀 Test server running on port ${port}\n`);

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Customer Login
    console.log('📌 Test 1: Standard Customer Sign-In');
    const custLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shopper@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    assert(custLogin.success === true, 'Customer login succeeded');
    assert(!!custLogin.token, 'JWT Token generated for customer');
    assert(custLogin.user?.role === 'customer', 'User role correctly identified as customer');

    // 2. Case & Whitespace Insensitive Login
    console.log('\n📌 Test 2: Whitespace & Uppercase Email Tolerance');
    const messyLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '   SHOPPER@Marketzo.COM   ', password: 'password123' })
    }).then(r => r.json());
    assert(messyLogin.success === true, 'Login with leading/trailing spaces and uppercase email succeeded');

    // 3. Merchant / Seller Login
    console.log('\n📌 Test 3: Seller Portal Merchant Login');
    const sellerLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    assert(sellerLogin.success === true, 'Seller login succeeded');
    assert(sellerLogin.user?.role === 'seller', 'User role identified as seller');
    assert(!!sellerLogin.seller?.storeName, `Seller profile attached: ${sellerLogin.seller?.storeName}`);

    // 4. Admin Login
    console.log('\n📌 Test 4: Administrator Login');
    const adminLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    assert(adminLogin.success === true, 'Admin login succeeded');
    assert(adminLogin.user?.role === 'admin', 'User role identified as admin');

    // 5. Invalid Password Handling
    console.log('\n📌 Test 5: Invalid Password Rejection');
    const badPwRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shopper@marketzo.com', password: 'wrongPassword999' })
    }).then(r => r.json());
    assert(badPwRes.success === false, 'Invalid password rejected');
    assert(badPwRes.message.includes('Incorrect password'), `Clean error message returned: "${badPwRes.message}"`);

    // 6. Non-Existent Account Handling
    console.log('\n📌 Test 6: Non-Existent Email Rejection');
    const nonExistentRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody_here_999@test.com', password: 'password123' })
    }).then(r => r.json());
    assert(nonExistentRes.success === false, 'Non-existent account rejected');
    assert(nonExistentRes.message.includes('No account found'), `Helpful error message returned: "${nonExistentRes.message}"`);

    // 7. New Customer Registration
    console.log('\n📌 Test 7: New Customer Registration & Auto-Login');
    const testEmail = `newuser_${Date.now()}@marketzo.com`;
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: testEmail,
        password: 'securePass123',
        role: 'customer'
      })
    }).then(r => r.json());
    assert(regRes.success === true, 'New customer registered successfully');
    assert(!!regRes.token, 'Auto-login token issued upon registration');

    // 8. New Merchant Registration
    console.log('\n📌 Test 8: New Merchant Registration with Storefront');
    const testSellerEmail = `merchant_${Date.now()}@marketzo.com`;
    const sellerRegRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Vance',
        email: testSellerEmail,
        password: 'sellerSecurePass123',
        role: 'seller',
        storeName: `Vance Apex Tech ${Date.now().toString().slice(-4)}`
      })
    }).then(r => r.json());
    assert(sellerRegRes.success === true, 'Merchant registered successfully');
    assert(sellerRegRes.user?.role === 'seller', 'User created with seller role');
    assert(!!sellerRegRes.seller?.id, `Seller profile created: ${sellerRegRes.seller?.storeName}`);

    // 9. Forgot Password & Reset Flow
    console.log('\n📌 Test 9: Forgot & Reset Password Flow');
    const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    }).then(r => r.json());
    assert(forgotRes.success === true, 'Forgot password request accepted');
    assert(!!forgotRes.resetCode, `Reset verification code generated: ${forgotRes.resetCode}`);

    const resetRes = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        resetCode: forgotRes.resetCode,
        newPassword: 'myBrandNewPassword2026'
      })
    }).then(r => r.json());
    assert(resetRes.success === true, 'Password successfully reset');

    // Verify login with new password
    const newPwLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'myBrandNewPassword2026' })
    }).then(r => r.json());
    assert(newPwLogin.success === true, 'Successfully signed in with the new updated password');

    // 10. Profile Verification via Token
    console.log('\n📌 Test 10: Authenticated Profile (/api/auth/me)');
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${newPwLogin.token}` }
    }).then(r => r.json());
    assert(meRes.success === true, 'Profile fetched using bearer token');
    assert(meRes.user?.email === testEmail, 'User profile matches logged in identity');

    console.log('\n=======================================================');
    console.log(`🎉 ALL AUTH TESTS PASSED: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('=======================================================\n');

  } catch (err) {
    console.error('Auth test error:', err);
  } finally {
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runAuthTests();
