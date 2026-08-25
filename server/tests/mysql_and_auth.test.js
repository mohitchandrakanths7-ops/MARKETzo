const http = require('http');
const express = require('express');
const cors = require('cors');

// Create test server instance
const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('../routes/auth');
const productRoutes = require('../routes/products');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

async function runTests() {
  console.log('🧪 Starting Marketzo Auth & MySQL Database Verification Suite...');

  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Verify demo-login endpoint is removed (should return 404)
    console.log('\n⏳ Test 1: Verify demo-login endpoint removal...');
    const demoRes = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'customer' })
    });
    console.log(`Demo login status: ${demoRes.status}`);
    if (demoRes.status === 404) {
      console.log('✅ Demo login endpoint successfully removed (returned 404).');
    } else {
      throw new Error(`Expected 404 for demo-login, got ${demoRes.status}`);
    }

    // 2. Register a real customer
    console.log('\n⏳ Test 2: Register a new real customer account...');
    const regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Belfort',
        email: `jordan_${Date.now()}@example.com`,
        password: 'securePassword123!',
        role: 'customer'
      })
    });
    const regData = await regRes.json();
    console.log('Registration response:', regData.success ? 'Success' : regData.message);
    if (!regData.success || !regData.token) {
      throw new Error(`Customer registration failed: ${JSON.stringify(regData)}`);
    }
    console.log(`✅ Customer registered with token and ID: ${regData.user.id}`);

    // 3. Login with registered customer credentials
    console.log('\n⏳ Test 3: Log in with registered customer credentials...');
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regData.user.email,
        password: 'securePassword123!'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.token) {
      throw new Error(`Customer login failed: ${JSON.stringify(loginData)}`);
    }
    console.log(`✅ Customer login verified! User: ${loginData.user.name} (${loginData.user.email})`);

    // 4. Register a real merchant
    console.log('\n⏳ Test 4: Register a new real merchant...');
    const merchRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Samantha Ray',
        email: `samantha_${Date.now()}@merchantstore.com`,
        password: 'merchantSecurePass123!',
        role: 'seller',
        storeName: `Solaris Optics ${Date.now()}`
      })
    });
    const merchData = await merchRes.json();
    if (!merchData.success || !merchData.seller) {
      throw new Error(`Merchant registration failed: ${JSON.stringify(merchData)}`);
    }
    console.log(`✅ Merchant registered successfully! Store: "${merchData.seller.storeName}"`);

    // 5. Fetch products
    console.log('\n⏳ Test 5: Verify product catalog queries...');
    const prodRes = await fetch(`${base}/products`);
    const prodData = await prodRes.json();
    if (!prodData.success || !Array.isArray(prodData.products)) {
      throw new Error(`Product query failed: ${JSON.stringify(prodData)}`);
    }
    console.log(`✅ Storefront catalog active with ${prodData.products.length} products.`);

    console.log('\n🎉 ALL AUTH & DATABASE TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
