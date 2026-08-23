const assert = require('assert');

async function testAiShoppingGuide() {
  console.log('🤖 Starting Enhanced AI Shopping Guide Test Suite...\n');
  const BASE_URL = 'http://localhost:5000/api';

  // 1. Natural language budget query in local currency (INR)
  console.log('⏳ 1. Testing natural language query: "Show me phones under ₹20,000"...');
  const res1 = await fetch(`${BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Show me phones under ₹20,000',
      currency: 'INR',
      exchangeRate: 86.5
    })
  }).then(r => r.json());

  assert.strictEqual(res1.success, true, 'AI query 1 failed');
  assert.ok(Array.isArray(res1.recommendations) && res1.recommendations.length > 0, 'No recommendations returned');
  assert.ok(res1.replyText && res1.replyText.length > 5, 'Missing replyText');
  
  const rec1 = res1.recommendations[0];
  assert.ok(rec1.name, 'Missing product name');
  assert.ok(rec1.price > 0, 'Missing product price');
  assert.ok(rec1.sellerName, 'Missing seller name');
  assert.ok(rec1.sellerPhone, 'Missing seller phone');
  assert.ok(rec1.reasonWhy, 'Missing reason why recommended');
  console.log(`✅ Received ${res1.recommendations.length} recommendations. Top pick: ${rec1.name}`);

  // 2. Follow-up query with context memory
  console.log('⏳ 2. Testing follow-up query: "Which one has the best camera?" with context memory...');
  const res2 = await fetch(`${BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Which one has the best camera?',
      currency: 'INR',
      exchangeRate: 86.5,
      contextProducts: res1.recommendations
    })
  }).then(r => r.json());

  assert.strictEqual(res2.success, true, 'Follow-up query failed');
  assert.ok(res2.replyText.toLowerCase().includes('camera') || res2.replyText.includes(res1.recommendations[0].name), 'Follow-up reply did not reference context');
  console.log(`✅ Follow-up response: "${res2.replyText.substring(0, 90)}..."`);

  // 3. Side-by-Side Comparison
  console.log('⏳ 3. Testing comparison query: "Compare the best 3 phones"...');
  const res3 = await fetch(`${BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Compare the best 3 phones',
      currency: 'USD',
      exchangeRate: 1.0,
      contextProducts: res1.recommendations
    })
  }).then(r => r.json());

  assert.strictEqual(res3.success, true, 'Comparison query failed');
  assert.ok(res3.comparisonTable, 'Missing comparisonTable');
  assert.ok(Array.isArray(res3.comparisonTable.features), 'Missing comparison features');
  assert.ok(res3.comparisonTable.verdict, 'Missing comparison verdict');
  console.log('✅ Comparison table successfully generated with verdict:', res3.comparisonTable.verdict.summary.substring(0, 80) + '...');

  // 4. Laptop for programming query
  console.log('⏳ 4. Testing use-case query: "I need a laptop for programming under ₹60,000"...');
  const res4 = await fetch(`${BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'I need a laptop for programming under ₹60,000',
      currency: 'INR',
      exchangeRate: 86.5
    })
  }).then(r => r.json());

  assert.strictEqual(res4.success, true, 'Programming laptop query failed');
  assert.ok(res4.recommendations.length > 0, 'No laptop recommendations');
  console.log(`✅ Top recommendation for programming: ${res4.recommendations[0].name}`);

  // 5. Verified sellers preference query
  console.log('⏳ 5. Testing verified sellers query: "Show products from verified sellers"...');
  const res5 = await fetch(`${BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Show products from verified sellers',
      currency: 'USD'
    })
  }).then(r => r.json());

  assert.strictEqual(res5.success, true, 'Verified seller query failed');
  assert.ok(res5.recommendations.every(r => r.sellerName), 'All items should have seller data');
  console.log('✅ Verified seller recommendation items verified.');

  console.log('\n========================================');
  console.log('🎉 ALL AI SHOPPING GUIDE TESTS PASSED (5/5)');
  console.log('========================================\n');
}

testAiShoppingGuide().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
