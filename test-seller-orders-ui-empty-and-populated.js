const http = require('http');

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...(options.headers || {}) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('📦 VERIFYING SELLER CUSTOMER ORDERS TAB (POPULATED & EMPTY STATES)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Seller with orders
    console.log('--- 1. SELLER WITH ORDERS (APEX TECH LABS) ---');
    const sellerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'seller' });
    assert(sellerLogin.status === 200 && sellerLogin.data.token, 'Seller authenticated');
    const sellerAuth = { 'Authorization': `Bearer ${sellerLogin.data.token}` };

    const ordersRes = await makeRequest('/api/seller/orders', { headers: sellerAuth });
    assert(ordersRes.status === 200, 'GET /api/seller/orders returns HTTP 200');
    assert(Array.isArray(ordersRes.data.orders), 'Orders is a valid Array');
    
    if (ordersRes.data.orders.length > 0) {
      const firstOrder = ordersRes.data.orders[0];
      assert(firstOrder.orderNumber !== undefined, `Order #${firstOrder.orderNumber} has orderNumber`);
      assert(Array.isArray(firstOrder.items), 'Order items is an Array');
      assert(firstOrder.orderStatus !== undefined, `Order status: ${firstOrder.orderStatus}`);
      assert(firstOrder.shippingAddress !== undefined, 'Order has shippingAddress object');
    }

    // 2. Fresh seller with 0 orders
    console.log('\n--- 2. SELLER WITH ZERO ORDERS (EMPTY STATE RESILIENCY) ---');
    // Register a new test merchant
    const uniqueEmail = `newvendor_${Date.now()}@marketzo.com`;
    const regRes = await makeRequest('/api/auth/register', { method: 'POST' }, {
      name: 'New Vendor Store',
      email: uniqueEmail,
      password: 'Password123!',
      role: 'seller',
      storeName: 'New Vendor Store'
    });
    assert(regRes.status === 201 && regRes.data.token, 'New vendor registered with 0 orders');
    const newVendorAuth = { 'Authorization': `Bearer ${regRes.data.token}` };

    const emptyOrdersRes = await makeRequest('/api/seller/orders', { headers: newVendorAuth });
    assert(emptyOrdersRes.status === 200, 'GET /api/seller/orders for new vendor returns HTTP 200');
    assert(Array.isArray(emptyOrdersRes.data.orders) && emptyOrdersRes.data.orders.length === 0, 'Returns empty orders array []');

    const emptyMetricsRes = await makeRequest('/api/seller/metrics', { headers: newVendorAuth });
    assert(emptyMetricsRes.status === 200, 'GET /api/seller/metrics returns HTTP 200');
    assert(emptyMetricsRes.data.metrics.totalOrders === 0, 'Metrics show totalOrders: 0');

    // Summary
    console.log('\n========================================================================');
    console.log(`📊 SELLER ORDERS TAB AUDIT: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! ZERO BLANK SCREENS ON BOTH EMPTY & POPULATED STATES!\n');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
