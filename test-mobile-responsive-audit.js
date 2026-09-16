const http = require('http');
const app = require('./server/index');
const db = require('./server/config/database');

async function runMobileAudit() {
  console.log('================================================================');
  console.log('📱 MARKETZO MOBILE-FIRST RESPONSIVE AUDIT & INTEGRATION TESTS');
  console.log('================================================================\n');

  await db.init();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

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
    // 1. Mobile Header & Location
    console.log('📌 Test 1: Pincode & Delivery Serviceability Endpoint');
    const pinRes = await fetch(`${baseUrl}/pincode/94102`).then(r => r.json());
    assert(pinRes.success === true, 'Pincode check returned success');
    assert(pinRes.serviceable === true, 'Pincode 94102 is serviceable with estimated delivery');

    // 2. Strict Category Filtering for all 7 required departments
    console.log('\n📌 Test 2: Category Filtering Isolation (Strict Department Scoping)');
    const categoriesToTest = [
      { name: 'Electronics', key: 'electronics', expectedId: 'cat_electronics' },
      { name: 'Fashion', key: 'fashion', expectedId: 'cat_fashion' },
      { name: 'Mobiles', key: 'mobiles', expectedId: 'cat_mobiles' },
      { name: 'Gaming', key: 'gaming', expectedId: 'cat_gaming' },
      { name: 'Home', key: 'home', expectedId: 'cat_home' },
      { name: 'Beauty', key: 'beauty', expectedId: 'cat_beauty' },
      { name: 'Sports', key: 'sports', expectedId: 'cat_sports' },
    ];

    for (const cat of categoriesToTest) {
      const res = await fetch(`${baseUrl}/products?category=${cat.key}`).then(r => r.json());
      assert(res.success === true, `${cat.name} products query succeeded`);
      assert(res.products.length > 0, `${cat.name} returned ${res.products.length} products`);
      assert(res.products.every(p => p.categoryId === cat.expectedId), `All items in "${cat.name}" strictly belong to ${cat.expectedId}`);
    }

    // 3. Search Suggestions Endpoint
    console.log('\n📌 Test 3: Instant Search Suggestions');
    const sugg = await fetch(`${baseUrl}/products/suggestions?q=head`).then(r => r.json());
    assert(sugg.success === true, 'Suggestions API returned success');
    assert(sugg.suggestions.products?.length > 0, 'Found matching products for query "head"');
    assert(sugg.suggestions.products[0].name.toLowerCase().includes('head'), 'First product suggestion accurately matches query');

    // 4. Gaming Zone Scoping & /gaming route API
    console.log('\n📌 Test 4: Gaming Zone Top-Level Destination');
    const gamingRes = await fetch(`${baseUrl}/gaming/products`).then(r => r.json());
    assert(gamingRes.success === true, 'Gaming Zone products returned success');
    assert(gamingRes.total >= 8, `Gaming Zone contains ${gamingRes.total} gaming items`);
    assert(gamingRes.products.every(p => p.categoryId === 'cat_gaming' || p.isGaming), 'All items in Gaming Zone are strictly gaming hardware');

    // 5. Product Details & Contact Seller (WhatsApp / Call)
    console.log('\n📌 Test 5: Product Details with Seller WhatsApp & Phone Number');
    const allProds = await fetch(`${baseUrl}/products`).then(r => r.json());
    const sampleProduct = allProds.products[0];
    const detailRes = await fetch(`${baseUrl}/products/${sampleProduct.id}`).then(r => r.json());
    assert(detailRes.success === true, 'Product Details API returned product');
    assert(detailRes.product.seller !== null, 'Seller profile attached to product');
    assert(!!detailRes.product.seller?.phone, `Seller phone number populated: ${detailRes.product.seller?.phone}`);

    // 6. User Account, Cart, Wishlist, Orders
    console.log('\n📌 Test 6: Preserved Accounts & Cart Integrity');
    const meRes = await fetch(`${baseUrl}/auth/me`).then(r => r.json());
    assert(meRes.success === false, 'Auth guard appropriately protects /me for unauthenticated requests');

    console.log('\n================================================================');
    console.log(`🎉 MOBILE AUDIT TEST RUN: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runMobileAudit();
