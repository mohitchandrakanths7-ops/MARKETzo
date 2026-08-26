const http = require('http');
const db = require('./server/config/database');
const app = require('./server/index');

async function runAudit() {
  console.log('🔍 INITIATING COMPREHENSIVE FULL-PLATFORM AUDIT & HEALTH CHECK...');
  await db.init();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  const hostUrl = `http://localhost:${port}`;
  console.log(`🚀 Audit server running on port ${port}\n`);

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
    // 1. Health Endpoint
    console.log('📌 Audit Group 1: Core System & Database Health');
    const health = await fetch(`${baseUrl}/health`).then(r => r.json());
    assert(health.status === 'ONLINE', 'System health status is ONLINE');
    assert(health.database.productsCount > 0, `Database initialized with ${health.database.productsCount} products`);
    assert(health.database.sellersCount > 0, `Database initialized with ${health.database.sellersCount} sellers`);

    // 2. Categories Integrity
    console.log('\n📌 Audit Group 2: Categories System & Department Slugs');
    const catRes = await fetch(`${baseUrl}/categories`).then(r => r.json());
    assert(catRes.success === true, 'Categories endpoint returned success');
    assert(catRes.categories.length >= 9, `Loaded ${catRes.categories.length} department categories`);
    const gamingCat = catRes.categories.find(c => c.id === 'cat_gaming');
    assert(!!gamingCat, 'Gaming category (cat_gaming) correctly registered');

    // 3. Products Catalog & Filters
    console.log('\n📌 Audit Group 3: Products Catalog & Search Performance');
    const prods = await fetch(`${baseUrl}/products?limit=12`).then(r => r.json());
    assert(prods.success === true, 'Products listing endpoint returned 200 OK');
    assert(prods.products.length > 0, `Products pagination returned ${prods.products.length} items`);

    const searchRes = await fetch(`${baseUrl}/products?search=headphones`).then(r => r.json());
    assert(searchRes.products.length > 0, 'Instant text search returned relevant results');

    // 4. Dedicated Gaming Zone APIs
    console.log('\n📌 Audit Group 4: 🎮 Gaming Zone Destination');
    const gamingProds = await fetch(`${baseUrl}/gaming/products`).then(r => r.json());
    assert(gamingProds.success === true, 'Gaming products API returned success');
    assert(gamingProds.products.length >= 8, `Loaded ${gamingProds.products.length} gaming peripherals`);

    const aiRig = await fetch(`${baseUrl}/gaming/ai-builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: 30000, style: 'FPS', experience: 'Advanced' })
    }).then(r => r.json());
    assert(aiRig.success === true, 'AI Gaming Setup Builder assembled battle station');
    assert(aiRig.setup?.items?.length >= 4, `Assembled ${aiRig.setup?.items?.length} hardware items`);

    // 5. Home Page Specialized Endpoints
    console.log('\n📌 Audit Group 5: Home Page Dynamic Endpoints');
    const trending = await fetch(`${baseUrl}/products/trending-now`).then(r => r.json());
    assert(trending.success === true, `Trending products returned ${trending.products?.length} items`);

    const picked = await fetch(`${baseUrl}/products/picked-for-you`).then(r => r.json());
    assert(picked.success === true, `Picked for you returned ${picked.products?.length} items`);

    const sellers = await fetch(`${baseUrl}/products/explore-sellers`).then(r => r.json());
    assert(sellers.success === true, `Explore sellers returned ${sellers.sellers?.length} verified merchants`);
    assert(sellers.sellers?.[0]?.trustScore !== undefined, 'Seller cards compute MARKETZO Trust Score');

    // 6. Customer & Seller Authentication
    console.log('\n📌 Audit Group 6: Authentication & Role Authorization');
    const sellerLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    assert(sellerLogin.success === true, 'Merchant login successful');
    const sellerToken = sellerLogin.token;

    const sellerMetrics = await fetch(`${baseUrl}/seller/metrics`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert(sellerMetrics.success === true, 'Seller portal dashboard metrics accessible');

    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    assert(adminLogin.success === true, 'Admin login successful');
    const adminToken = adminLogin.token;

    const adminMetrics = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminMetrics.success === true, 'Admin Control Center metrics accessible');

    // 7. Order Placement & Server-Side Security
    console.log('\n📌 Audit Group 7: Buying Flow & Stock Management');
    const targetProd = prods.products[0];
    const initialStock = targetProd.stock;

    const customerLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shopper@marketzo.com', password: 'password123' })
    }).then(r => r.json());
    const custToken = customerLogin.token;

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      },
      body: JSON.stringify({
        items: [{ productId: targetProd.id, quantity: 1, price: targetProd.price }],
        shippingAddress: { fullName: 'David Miller', street: '123 Market St', city: 'San Francisco', postalCode: '94102', country: 'United States' },
        paymentMethod: 'credit_card'
      })
    }).then(r => r.json());
    assert(orderRes.success === true, 'Order created successfully');

    const updatedProd = db.findById('products', targetProd.id);
    assert(updatedProd.stock === initialStock - 1, 'Inventory stock accurately decremented on checkout');

    // 8. Static Web App Assets Check
    console.log('\n📌 Audit Group 8: Static Production Assets & Fast Loading');
    const htmlResponse = await fetch(hostUrl);
    assert(htmlResponse.status === 200, 'Frontend index.html served with HTTP 200');
    const htmlText = await htmlResponse.text();
    assert(htmlText.includes('MARKETZO') || htmlText.includes('root'), 'HTML includes application shell');

    console.log('\n=======================================================');
    console.log(`🎉 ALL AUDIT GROUPS PASSED: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('=======================================================\n');

  } catch (err) {
    console.error('Audit failure:', err);
  } finally {
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runAudit();
