async function testMerchantLaunchFlow() {
  console.log('========================================================================');
  console.log('🧪 TESTING "LAUNCH MY MERCHANT STORE" END-TO-END FLOW');
  console.log('========================================================================\n');

  const base = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // STEP 1: REGISTER A NEW REGULAR CUSTOMER
    // ------------------------------------------------------------------------
    console.log('--- 1. REGISTER NEW CUSTOMER ACCOUNT ---');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const customerEmail = `shopper_${randomSuffix}@marketzo-test.com`;
    const customerPass = 'Password123!';

    const regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Shopper User ${randomSuffix}`,
        email: customerEmail,
        password: customerPass,
        role: 'customer'
      })
    }).then(r => r.json());

    assert('Customer Registration', regRes.success && regRes.token, `ID: ${regRes.user?.id}, Role: ${regRes.user?.role}`);
    const customerToken = regRes.token;

    // Verify initial profile is customer, not seller
    const initialProfile = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert('Initial Role is Customer', initialProfile.user?.role === 'customer' && initialProfile.seller === null);

    // Verify customer cannot access seller routes yet
    const blockedMetrics = await fetch(`${base}/seller/metrics`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert('Customer blocked from seller portal', blockedMetrics.status === 403, `Status: ${blockedMetrics.status}`);

    // ------------------------------------------------------------------------
    // STEP 2: TEST VALIDATION ON BECOME-SELLER
    // ------------------------------------------------------------------------
    console.log('\n--- 2. INPUT VALIDATION & ERROR HANDLING ---');
    const emptyStoreRes = await fetch(`${base}/auth/become-seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ storeName: ' ' })
    });
    const emptyStoreJson = await emptyStoreRes.json();
    assert('Empty Store Name rejected with 400', emptyStoreRes.status === 400 && emptyStoreJson.success === false, emptyStoreJson.message);

    const unauthRes = await fetch(`${base}/auth/become-seller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName: 'Sneaker Emporium' })
    });
    assert('Unauthenticated call rejected with 401', unauthRes.status === 401);

    // ------------------------------------------------------------------------
    // STEP 3: LAUNCH MERCHANT STORE VIA POST /api/auth/become-seller
    // ------------------------------------------------------------------------
    console.log('\n--- 3. LAUNCH MERCHANT STORE (BECOME SELLER) ---');
    const storeName = `HyperNova Electronics ${randomSuffix}`;
    const launchRes = await fetch(`${base}/auth/become-seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        storeName: storeName,
        phone: '+1 800 555 9876',
        description: 'Authorized retailer of futuristic consumer tech and accessories.'
      })
    }).then(r => r.json());

    assert('Launch Merchant Store API Success', launchRes.success === true, launchRes.message);
    assert('Upgraded User Role to Seller', launchRes.user?.role === 'seller');
    assert('Seller Profile Created', launchRes.seller && launchRes.seller.storeName === storeName, `Seller ID: ${launchRes.seller?.id}`);
    assert('New Token Issued', !!launchRes.token);

    const upgradedToken = launchRes.token;

    // ------------------------------------------------------------------------
    // STEP 4: VERIFY GET /api/auth/me REFLECTS SELLER STATUS
    // ------------------------------------------------------------------------
    console.log('\n--- 4. AUTH STATE & PROFILE VERIFICATION ---');
    const meRes = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${upgradedToken}` }
    }).then(r => r.json());

    assert('GET /api/auth/me returns role="seller"', meRes.user?.role === 'seller');
    assert('GET /api/auth/me returns seller object', meRes.seller && meRes.seller.storeName === storeName);

    // ------------------------------------------------------------------------
    // STEP 5: VERIFY SELLER CAN ACCESS MERCHANT PORTAL & ADD PRODUCTS
    // ------------------------------------------------------------------------
    console.log('\n--- 5. SELLER DASHBOARD METRICS & PRODUCT MANAGEMENT ---');
    const sellerMetrics = await fetch(`${base}/seller/metrics`, {
      headers: { Authorization: `Bearer ${upgradedToken}` }
    }).then(r => r.json());

    assert('Access /api/seller/metrics with new token', sellerMetrics.success === true, `Active Store: ${sellerMetrics.seller?.storeName}`);

    const newProductRes = await fetch(`${base}/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${upgradedToken}`
      },
      body: JSON.stringify({
        name: `HyperPad Max ${randomSuffix}`,
        categoryId: 'cat_electronics',
        brandId: 'br_aurora',
        price: 299.99,
        originalPrice: 349.99,
        stock: 25,
        sku: `HPD-${randomSuffix}`,
        weight: '0.6 kg',
        shippingInfo: 'Free 2-Day Air',
        tags: ['tablet', 'electronics', 'new'],
        status: 'approved',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'],
        description: 'Ultra high-definition display tablet with fast processor.'
      })
    }).then(r => r.json());

    assert('Create Product as New Merchant', newProductRes.success === true, `Product ID: ${newProductRes.product?.id}`);

    // Verify product appears in merchant catalog
    const sellerProducts = await fetch(`${base}/seller/products`, {
      headers: { Authorization: `Bearer ${upgradedToken}` }
    }).then(r => r.json());
    assert('Product Listed in Merchant Store', sellerProducts.products?.some(p => p.id === newProductRes.product?.id));

    // ------------------------------------------------------------------------
    // STEP 6: VERIFY BACKWARD-COMPATIBLE PUT /api/auth/profile UPGRADE
    // ------------------------------------------------------------------------
    console.log('\n--- 6. TEST BACKWARD-COMPATIBILITY: PUT /api/auth/profile ---');
    const anotherEmail = `customer2_${randomSuffix}@marketzo-test.com`;
    const reg2Res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Customer Two ${randomSuffix}`,
        email: anotherEmail,
        password: customerPass,
        role: 'customer'
      })
    }).then(r => r.json());

    const updateProfileRes = await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reg2Res.token}`
      },
      body: JSON.stringify({
        storeName: `Quantum Audio Labs ${randomSuffix}`
      })
    }).then(r => r.json());

    assert('PUT /auth/profile upgrades customer to seller', updateProfileRes.success === true && updateProfileRes.user?.role === 'seller');
    assert('PUT /auth/profile creates seller profile', updateProfileRes.seller?.storeName === `Quantum Audio Labs ${randomSuffix}`);

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(`🎉 TEST AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

testMerchantLaunchFlow();
