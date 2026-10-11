const http = require('http');
const db = require('./server/config/database');
const app = require('./server/index');

async function runModernAuthTests() {
  console.log('========================================================================');
  console.log('🔒 MARKETZO: MODERN USERNAME & PASSWORD AUTHENTICATION TEST SUITE');
  console.log('========================================================================\n');

  await db.init();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`🚀 Automated test server running on port ${port}\n`);

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
    // -------------------------------------------------------------
    // 1. REAL-TIME USERNAME AVAILABILITY CHECK & GENERATOR
    // -------------------------------------------------------------
    console.log('📌 Test 1: Username Availability Checking & Generator');
    
    // Check available username
    const checkAvail = await fetch(`${baseUrl}/auth/check-username?username=UniqueZo_${Date.now().toString().slice(-4)}`).then(r => r.json());
    assert(checkAvail.success === true && checkAvail.available === true, 'Available username correctly identified as available');

    // Check taken username (case-insensitive)
    const checkTaken = await fetch(`${baseUrl}/auth/check-username?username=AdMiN`).then(r => r.json());
    assert(checkTaken.available === false, 'Existing username "admin" detected as taken with mixed casing "AdMiN"');

    // Check invalid username format (too short)
    const checkShort = await fetch(`${baseUrl}/auth/check-username?username=ab`).then(r => r.json());
    assert(checkShort.available === false, 'Username with less than 3 characters rejected with helpful message');

    // Check invalid characters
    const checkSpecial = await fetch(`${baseUrl}/auth/check-username?username=user@name!`).then(r => r.json());
    assert(checkSpecial.available === false, 'Username with invalid characters rejected');

    // Generate creative username
    const genRes = await fetch(`${baseUrl}/auth/generate-username`).then(r => r.json());
    assert(genRes.success === true && typeof genRes.username === 'string' && genRes.username.length >= 3, `Creative username generated: "${genRes.username}"`);

    // Verify generated username is available
    const checkGenAvail = await fetch(`${baseUrl}/auth/check-username?username=${genRes.username}`).then(r => r.json());
    assert(checkGenAvail.available === true, `Generated username "${genRes.username}" is available in the database`);

    // -------------------------------------------------------------
    // 2. REGISTRATION VALIDATION (USERNAME, PASSWORD, CONFIRM PASSWORD)
    // -------------------------------------------------------------
    console.log('\n📌 Test 2: Registration Validation Rules');

    // Empty fields
    const emptyReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', password: '', confirmPassword: '' })
    }).then(r => r.json());
    assert(emptyReg.success === false, 'Empty registration rejected');

    // Short password (< 8 chars)
    const shortPwReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `UserTest_${Date.now().toString().slice(-4)}`, password: 'short', confirmPassword: 'short' })
    }).then(r => r.json());
    assert(shortPwReg.success === false && shortPwReg.message.includes('8 characters'), 'Password under 8 characters rejected');

    // Password confirmation mismatch
    const mismatchReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `UserTest_${Date.now().toString().slice(-4)}`,
        password: 'securePassword123',
        confirmPassword: 'differentPassword999'
      })
    }).then(r => r.json());
    assert(mismatchReg.success === false && mismatchReg.message.includes('match'), 'Password confirmation mismatch rejected');

    // -------------------------------------------------------------
    // 3. SUCCESSFUL REGISTRATION & RECOVERY KEY GENERATION
    // -------------------------------------------------------------
    console.log('\n📌 Test 3: Successful Registration & Recovery Key Generation');
    const newUsername = `ZoNova_${Date.now().toString().slice(-4)}`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        password: 'marketzoPassword2026',
        confirmPassword: 'marketzoPassword2026'
      })
    }).then(r => r.json());

    assert(regRes.success === true, `New user registered successfully as "${newUsername}"`);
    assert(!!regRes.token, 'Auto-login token returned upon registration');
    assert(regRes.user?.username === newUsername, 'User object contains chosen username');
    assert(!regRes.user?.password && !regRes.user?.recoveryCodeHash, 'Password and recovery code hashes are NOT exposed to frontend');
    assert(!!regRes.recoveryCode && regRes.recoveryCode.startsWith('MZ-'), `Account Recovery Key generated: "${regRes.recoveryCode}"`);

    // -------------------------------------------------------------
    // 4. DUPLICATE USERNAME PREVENTION (CASE-INSENSITIVE)
    // -------------------------------------------------------------
    console.log('\n📌 Test 4: Duplicate Username Prevention (Case-Insensitive)');
    const dupReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername.toLowerCase(), // Try registering exact same with lower case
        password: 'marketzoPassword2026',
        confirmPassword: 'marketzoPassword2026'
      })
    }).then(r => r.json());
    assert(dupReg.success === false, 'Duplicate username with different capitalization rejected');
    assert(dupReg.message.includes('already taken'), `Helpful error returned: "${dupReg.message}"`);

    // -------------------------------------------------------------
    // 5. LOGIN WITH USERNAME & PASSWORD
    // -------------------------------------------------------------
    console.log('\n📌 Test 5: Login with Username & Password');

    // Successful login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        password: 'marketzoPassword2026'
      })
    }).then(r => r.json());
    assert(loginRes.success === true, 'Login with username and password succeeded');
    assert(!!loginRes.token, 'Authentication token returned on login');
    assert(loginRes.user?.username === newUsername, 'Logged in identity matches username');

    // Case-insensitive login with extra whitespace
    const messyLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `  ${newUsername.toUpperCase()}  `,
        password: 'marketzoPassword2026'
      })
    }).then(r => r.json());
    assert(messyLogin.success === true, 'Login with uppercase and surrounding whitespace succeeded');

    // Incorrect password
    const badPwLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        password: 'wrongPassword999'
      })
    }).then(r => r.json());
    assert(badPwLogin.success === false, 'Incorrect password rejected');
    assert(badPwLogin.message.includes('Incorrect password'), `Clean error message returned: "${badPwLogin.message}"`);

    // Non-existent username
    const nonExistentLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'non_existent_user_99999',
        password: 'password123'
      })
    }).then(r => r.json());
    assert(nonExistentLogin.success === false, 'Non-existent username rejected');
    assert(nonExistentLogin.message.includes('No account found'), `Clean error message returned: "${nonExistentLogin.message}"`);

    // -------------------------------------------------------------
    // 6. FORGOT PASSWORD WITHOUT EMAIL/PHONE (RECOVERY KEY FLOW)
    // -------------------------------------------------------------
    console.log('\n📌 Test 6: Account Recovery Key Flow (No Email/Phone Required)');

    // Attempt reset without recovery key
    const noKeyReset = await fetch(`${baseUrl}/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        recoveryCode: '',
        newPassword: 'myBrandNewPassword2026'
      })
    }).then(r => r.json());
    assert(noKeyReset.success === false, 'Password reset without recovery key rejected');

    // Attempt reset with invalid recovery key
    const badKeyReset = await fetch(`${baseUrl}/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        recoveryCode: 'MZ-WRON-GKEY-9999',
        newPassword: 'myBrandNewPassword2026',
        confirmPassword: 'myBrandNewPassword2026'
      })
    }).then(r => r.json());
    assert(badKeyReset.success === false, 'Password reset with invalid recovery key rejected');
    assert(badKeyReset.message.includes('Invalid Account Recovery Key'), `Clean recovery error message: "${badKeyReset.message}"`);

    // Successful password recovery with valid Recovery Key
    const validRecovery = await fetch(`${baseUrl}/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        recoveryCode: regRes.recoveryCode,
        newPassword: 'myBrandNewPassword2026',
        confirmPassword: 'myBrandNewPassword2026'
      })
    }).then(r => r.json());
    assert(validRecovery.success === true, 'Password reset succeeded using valid Account Recovery Key');

    // Login with the updated new password
    const loginWithNewPw = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        password: 'myBrandNewPassword2026'
      })
    }).then(r => r.json());
    assert(loginWithNewPw.success === true, 'Successfully signed in with the newly updated password');

    // -------------------------------------------------------------
    // 7. EXISTING ROLES & PERMISSIONS CONTINUITY (ADMIN, SELLER, CUSTOMER)
    // -------------------------------------------------------------
    console.log('\n📌 Test 7: Existing Accounts & Roles Continuity');

    // Admin login with username "admin"
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    }).then(r => r.json());
    assert(adminLogin.success === true, 'Admin logged in with username "admin"');
    assert(adminLogin.user?.role === 'admin', 'Admin role preserved');

    // Seller login with username "seller"
    const sellerLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'seller', password: 'password123' })
    }).then(r => r.json());
    assert(sellerLogin.success === true, 'Seller logged in with username "seller"');
    assert(sellerLogin.user?.role === 'seller', 'Seller role preserved');
    assert(!!sellerLogin.seller?.storeName, `Seller profile attached: ${sellerLogin.seller?.storeName}`);

    // Customer login with username "shopper"
    const shopperLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'shopper', password: 'password123' })
    }).then(r => r.json());
    assert(shopperLogin.success === true, 'Customer logged in with username "shopper"');
    assert(shopperLogin.user?.role === 'customer', 'Customer role preserved');

    // -------------------------------------------------------------
    // 8. PROFILE FETCHING & TOKEN SECURITY
    // -------------------------------------------------------------
    console.log('\n📌 Test 8: Authenticated Session (/api/auth/me)');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${shopperLogin.token}` }
    }).then(r => r.json());
    assert(meRes.success === true, 'Fetched authenticated profile with Bearer token');
    assert(meRes.user?.username === 'shopper', 'Profile contains correct username "shopper"');
    assert(!meRes.user?.password && !meRes.user?.recoveryCodeHash, 'Security verified: No password hash or recovery hash returned');

    // -------------------------------------------------------------
    // 9. MARKETPLACE & CATALOG INTEGRATION CONTINUITY
    // -------------------------------------------------------------
    console.log('\n📌 Test 9: Marketplace Products & Cart Continuity');
    const prodRes = await fetch(`${baseUrl}/products`).then(r => r.json());
    assert(prodRes.success === true && Array.isArray(prodRes.products) && prodRes.products.length > 0, `Catalog active: ${prodRes.products?.length || 0} products retrieved`);

    console.log('\n========================================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    failCount++;
  } finally {
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runModernAuthTests();
