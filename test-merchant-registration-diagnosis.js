const BASE_URL = 'http://127.0.0.1:5000/api';
let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    failCount++;
  }
}

async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runAudit() {
  console.log('\n========================================================================');
  console.log('🧪 DIAGNOSING & TESTING MERCHANT REGISTRATION FLOW COMPLETE');
  console.log('========================================================================\n');

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testMerchant = {
    name: `Elena Rostova ${randomSuffix}`,
    email: `elena.merchant.${randomSuffix}@marketzo-store.com`,
    password: `MerchantSecret!${randomSuffix}`,
    role: 'seller',
    storeName: `Elena Luxe Collections ${randomSuffix}`
  };

  // 1. INPUT VALIDATION TESTS
  console.log('--- 1. INPUT VALIDATION & SANITIZATION ---');
  
  // 1.1 Short name
  const res1 = await apiRequest('/auth/register', 'POST', {
    name: ' ',
    email: 'valid@test.com',
    password: 'password123',
    role: 'seller',
    storeName: 'Valid Store'
  });
  assert(res1.status === 400, 'Reject empty/short name', res1.data?.message);

  // 1.2 Invalid email format
  const res2 = await apiRequest('/auth/register', 'POST', {
    name: 'Valid Name',
    email: 'not-an-email',
    password: 'password123',
    role: 'seller',
    storeName: 'Valid Store'
  });
  assert(res2.status === 400, 'Reject invalid email format', res2.data?.message);

  // 1.3 Short password (< 4 chars)
  const res3 = await apiRequest('/auth/register', 'POST', {
    name: 'Valid Name',
    email: 'valid@test.com',
    password: '12',
    role: 'seller',
    storeName: 'Valid Store'
  });
  assert(res3.status === 400, 'Reject password < 4 chars', res3.data?.message);

  // 1.4 Missing store name for seller role
  const res4 = await apiRequest('/auth/register', 'POST', {
    name: 'Valid Name',
    email: 'valid@test.com',
    password: 'password123',
    role: 'seller',
    storeName: ' '
  });
  assert(res4.status === 400, 'Reject missing storeName for seller', res4.data?.message);

  // 2. GUEST MERCHANT REGISTRATION FLOW
  console.log('\n--- 2. GUEST NEW MERCHANT REGISTRATION ---');
  const regRes = await apiRequest('/auth/register', 'POST', testMerchant);
  assert(regRes.status === 201, 'Merchant Registration returns HTTP 201', `Message: ${regRes.data.message}`);
  assert(regRes.data.success === true, 'Response indicates success: true');
  assert(!!regRes.data.token, 'Fresh JWT Token issued for merchant');
  assert(regRes.data.user?.role === 'seller', 'User role set to seller');
  assert(regRes.data.user?.password === undefined, 'Password is stripped from response (never exposed)');
  assert(!!regRes.data.seller, 'Seller profile object returned');
  assert(regRes.data.seller?.storeName === testMerchant.storeName, 'Store name preserved accurately');
  assert(regRes.data.seller?.status === 'approved', 'Store status set to approved');

  const merchantToken = regRes.data?.token;

  // 3. VERIFY LOGIN WITH NEW MERCHANT CREDENTIALS
  console.log('\n--- 3. VERIFY MERCHANT LOGIN & ME ENDPOINT ---');
  const loginRes = await apiRequest('/auth/login', 'POST', {
    email: testMerchant.email,
    password: testMerchant.password
  });
  assert(loginRes.status === 200, 'Merchant Login Successful', `User: ${loginRes.data.user?.name}`);
  assert(loginRes.data.user?.role === 'seller', 'Login recognizes role as seller');
  assert(loginRes.data.seller?.storeName === testMerchant.storeName, 'Login returns seller profile');

  // 4. DUPLICATE STORE NAME COLLISION
  console.log('\n--- 4. DUPLICATE STORE NAME HANDLING ---');
  const dupStoreRes = await apiRequest('/auth/register', 'POST', {
    name: 'Another Merchant',
    email: `different.email.${randomSuffix}@marketzo.com`,
    password: 'password123',
    role: 'seller',
    storeName: testMerchant.storeName // duplicate store name
  });
  assert(dupStoreRes.status === 400, 'Reject duplicate store name', dupStoreRes.data?.message);

  // 5. EXISTING CUSTOMER ACCOUNT UPGRADING VIA MERCHANT FORM
  console.log('\n--- 5. EXISTING CUSTOMER AUTO-UPGRADE VIA MERCHANT FORM ---');
  const customerEmail = `shopper.${randomSuffix}@marketzo.com`;
  const customerPass = `ShopperPass!${randomSuffix}`;
  
  // Register customer first
  await apiRequest('/auth/register', 'POST', {
    name: `Shopper ${randomSuffix}`,
    email: customerEmail,
    password: customerPass,
    role: 'customer'
  });

  // Now submit merchant registration with the same customer email & password
  const upgradeRes = await apiRequest('/auth/register', 'POST', {
    name: `Shopper ${randomSuffix}`,
    email: customerEmail,
    password: customerPass,
    role: 'seller',
    storeName: `Shopper Boutique ${randomSuffix}`
  });
  assert(upgradeRes.status === 200, 'Auto-upgrade existing customer with valid password returns HTTP 200', upgradeRes.data?.message);
  assert(upgradeRes.data.user?.role === 'seller', 'Upgraded role is seller');
  assert(upgradeRes.data.seller?.storeName === `Shopper Boutique ${randomSuffix}`, 'Seller profile created during upgrade');

  // 6. EXISTING USER WITH WRONG PASSWORD
  console.log('\n--- 6. EXISTING USER WITH INCORRECT PASSWORD ---');
  const wrongPassRes = await apiRequest('/auth/register', 'POST', {
    name: `Shopper ${randomSuffix}`,
    email: customerEmail,
    password: 'WrongPassword!',
    role: 'seller',
    storeName: `Shopper Brand ${randomSuffix}`
  });
  assert(wrongPassRes.status === 400, 'Reject existing email with incorrect password', wrongPassRes.data?.message);

  // 7. SELLER PORTAL ACCESS & CATALOG MANAGEMENT
  console.log('\n--- 7. SELLER PORTAL METRICS & PRODUCT CREATION ---');
  if (merchantToken) {
    const metRes = await apiRequest('/seller/metrics', 'GET', null, merchantToken);
    assert(metRes.status === 200, 'Merchant accesses Seller Metrics', `Store: ${metRes.data.seller?.storeName}`);

    const prodRes = await apiRequest('/seller/products', 'POST', {
      name: `Handcrafted Silk Scarf ${randomSuffix}`,
      description: 'Premium luxury mulberry silk scarf with hand-rolled edges.',
      price: 89.99,
      category: 'fashion-apparel',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80']
    }, merchantToken);
    assert(prodRes.status === 201, 'New Merchant creates product listing', `Product: ${prodRes.data.product?.name}`);
  }

  console.log('\n========================================================================');
  console.log(`📊 FINAL RESULT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================================\n');

  if (failCount > 0) process.exit(1);
}

runAudit();
