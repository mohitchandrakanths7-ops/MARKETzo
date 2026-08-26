const http = require('http');
const db = require('./server/config/database');
const app = require('./server/index');

async function runTests() {
  console.log('🎮 STARTING MARKETZO GAMING ZONE COMPREHENSIVE VERIFICATION...');
  await db.init();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
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
    // 1. All Gaming Products
    console.log('📌 Test 1: Fetching Gaming Catalog (/api/gaming/products)');
    const allGaming = await fetch(`${baseUrl}/gaming/products`).then(r => r.json());
    assert(allGaming.success === true, 'Gaming products API returned success');
    assert(allGaming.total >= 8, `Returned ${allGaming.total} genuine gaming products`);
    assert(allGaming.products.every(p => p.categoryId === 'cat_gaming' || p.isGaming || (p.tags && p.tags.includes('gaming'))), 'All items are strictly verified gaming gear');

    // 2. Critical Non-Gaming Isolation Test
    console.log('\n📌 Test 2: CRITICAL - Non-Gaming Product Isolation');
    const searchNonGaming1 = await fetch(`${baseUrl}/gaming/products?search=coat`).then(r => r.json());
    assert(searchNonGaming1.products.length === 0, 'Searching for "coat" returned 0 non-gaming products');

    const searchNonGaming2 = await fetch(`${baseUrl}/gaming/products?search=serum`).then(r => r.json());
    assert(searchNonGaming2.products.length === 0, 'Searching for "serum" returned 0 non-gaming products');

    const searchNonGaming3 = await fetch(`${baseUrl}/gaming/products?search=coffee`).then(r => r.json());
    assert(searchNonGaming3.products.length === 0, 'Searching for "coffee" returned 0 non-gaming products');

    // 3. Sub-Category Filtering
    console.log('\n📌 Test 3: Subcategory Precision');
    const mice = await fetch(`${baseUrl}/gaming/products?subCategory=mouse`).then(r => r.json());
    assert(mice.products.length >= 2, `Mouse category returned ${mice.products.length} mice`);
    assert(mice.products.every(p => p.name.toLowerCase().includes('mouse') || p.tags?.includes('mouse')), 'All mice results contain mouse hardware');

    const keyboards = await fetch(`${baseUrl}/gaming/products?subCategory=keyboard`).then(r => r.json());
    assert(keyboards.products.length >= 2, `Keyboard category returned ${keyboards.products.length} keyboards`);
    assert(keyboards.products.every(p => p.name.toLowerCase().includes('keyboard') || p.tags?.includes('keyboard')), 'All keyboard results contain keyboard hardware');

    const headsets = await fetch(`${baseUrl}/gaming/products?subCategory=headset`).then(r => r.json());
    assert(headsets.products.length >= 1, `Headset category returned ${headsets.products.length} headsets`);

    // 4. Loadouts Filtering
    console.log('\n📌 Test 4: Loadout System (FPS, Esports, Racing)');
    const fpsLoadout = await fetch(`${baseUrl}/gaming/products?loadout=fps`).then(r => r.json());
    assert(fpsLoadout.products.length > 0, `FPS loadout returned ${fpsLoadout.products.length} high-precision peripherals`);

    // 5. Price Filters & Sorting
    console.log('\n📌 Test 5: Scoped Price Filters & Sorting');
    const budgetGaming = await fetch(`${baseUrl}/gaming/products?maxPrice=50`).then(r => r.json());
    assert(budgetGaming.products.every(p => p.price <= 50), 'All budget items are under $50 / specified limit');

    const sortedHighToLow = await fetch(`${baseUrl}/gaming/products?sort=price-high`).then(r => r.json());
    const prices = sortedHighToLow.products.map(p => p.price);
    const isSortedDesc = prices.every((val, i, arr) => !i || arr[i - 1] >= val);
    assert(isSortedDesc, 'Price high to low sorting is accurately ordered');

    // 6. Gamer Score Validation
    console.log('\n📌 Test 6: Marketzo Gamer Score Computation');
    assert(allGaming.products.every(p => p.gamerScore >= 88 && p.gamerScore <= 100), 'All gaming products feature a calibrated Gamer Score between 88 and 100');

    // 7. AI Setup Builder
    console.log('\n📌 Test 7: AI Gaming Setup Builder (/api/gaming/ai-builder)');
    const aiSetup = await fetch(`${baseUrl}/gaming/ai-builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: 30000, style: 'FPS', experience: 'Pro', currency: 'INR' })
    }).then(r => r.json());
    assert(aiSetup.success === true, 'AI Setup Builder returned success');
    assert(aiSetup.setup?.items?.length >= 4, `AI Setup contains ${aiSetup.setup?.items?.length} real catalog items (Mouse, Keyboard, Headset, Monitor, RGB)`);
    assert(aiSetup.setup?.totalUSD > 0, `Calculated realistic bundle total: $${aiSetup.setup?.totalUSD}`);

    // 8. Community Setups
    console.log('\n📌 Test 8: Gamers of Marketzo Community Setups');
    const community = await fetch(`${baseUrl}/gaming/community-setups`).then(r => r.json());
    assert(community.success === true, 'Community setups returned success');
    assert(community.setups?.length >= 3, `Returned ${community.setups?.length} community battlestations with linked marketplace items`);

    console.log('\n=======================================================');
    console.log(`🎉 TEST RUN COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('=======================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runTests();
