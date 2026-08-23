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

async function runCurrencyTests() {
  console.log('====================================================');
  console.log('🚀 MARKETZO AUTOMATIC CURRENCY SYSTEM TEST SUITE');
  console.log('====================================================\n');

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
    // 1. Fetch Currency Exchange Rates
    console.log('--- TEST 1: Currency Rates Endpoint ---');
    const ratesRes = await makeRequest('/api/currency/rates');
    assert(ratesRes.status === 200, 'GET /api/currency/rates returns HTTP 200');
    assert(ratesRes.data && ratesRes.data.success === true, 'Rates response success is true');
    assert(ratesRes.data.base === 'USD', 'Base currency is USD');
    assert(ratesRes.data.rates && ratesRes.data.rates.INR >= 80, `INR rate is available (${ratesRes.data?.rates?.INR})`);
    assert(ratesRes.data.rates && ratesRes.data.rates.EUR > 0, `EUR rate is available (${ratesRes.data?.rates?.EUR})`);
    assert(ratesRes.data.rates && ratesRes.data.rates.GBP > 0, `GBP rate is available (${ratesRes.data?.rates?.GBP})`);
    assert(ratesRes.data.rates && ratesRes.data.rates.AED > 0, `AED rate is available (${ratesRes.data?.rates?.AED})`);
    assert(ratesRes.data.rates && ratesRes.data.rates.JPY > 0, `JPY rate is available (${ratesRes.data?.rates?.JPY})`);

    // 2. Currency Detection Endpoint
    console.log('\n--- TEST 2: Currency Detection Endpoint ---');
    const detectRes = await makeRequest('/api/currency/detect');
    assert(detectRes.status === 200, 'GET /api/currency/detect returns HTTP 200');
    assert(detectRes.data && detectRes.data.success === true, 'Detect response success is true');
    assert(detectRes.data.detectedCountry && detectRes.data.detectedCountry.code === 'IN', `Detected country: ${detectRes.data.detectedCountry?.name} (${detectRes.data.detectedCountry?.code})`);
    assert(detectRes.data.currency === 'INR', `Suggested currency: ${detectRes.data.currency}`);

    // 3. User Authentication for Multi-Currency Order Placement
    console.log('\n--- TEST 3: User Login & Profile ---');
    const loginRes = await makeRequest('/api/auth/demo-login', { method: 'POST' }, {
      role: 'customer'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Customer logged in successfully via demo-login');
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // 4. Fetch Products and verify prices in base USD
    console.log('\n--- TEST 4: Products Base Pricing in USD ---');
    const prodRes = await makeRequest('/api/products?limit=5');
    assert(prodRes.status === 200 && prodRes.data.products.length > 0, 'Products retrieved successfully');
    const firstProduct = prodRes.data.products[0];
    assert(typeof firstProduct.price === 'number' && firstProduct.price > 0, `Product price stored as base USD number: $${firstProduct.price}`);

    // 5. Place Order with INR currency and exchangeRate recorded
    console.log('\n--- TEST 5: Place Order with Local Currency Metadata (INR ₹) ---');
    const inrRate = ratesRes.data.rates.INR;
    const orderPayloadINR = {
      items: [
        {
          id: firstProduct.id,
          productId: firstProduct.id,
          name: firstProduct.name,
          price: firstProduct.price,
          quantity: 2,
          image: firstProduct.images?.[0]
        }
      ],
      shippingAddress: {
        fullName: 'Alex Mercer',
        phone: '+91 98765 43210',
        street: '100 Marine Drive',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400020',
        country: 'India'
      },
      paymentMethod: 'Instant UPI / QR (alex@marketzo)',
      deliverySpeed: 'standard',
      currency: 'INR',
      exchangeRate: inrRate,
      displayTotal: `₹${(firstProduct.price * 2 * inrRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };

    const inrOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: authHeaders
    }, orderPayloadINR);

    if (inrOrderRes.status !== 201) {
      console.log('DEBUG inrOrderRes:', inrOrderRes);
    }

    assert(inrOrderRes.status === 201, 'Order created with HTTP 201 Created');
    assert(inrOrderRes.data && inrOrderRes.data.success === true, 'Order creation success is true');
    const inrOrder = inrOrderRes.data?.order || {};
    assert(inrOrder.currency === 'INR', 'Order currency accurately recorded as INR');
    assert(inrOrder.exchangeRate === inrRate, `Order exchangeRate accurately recorded as ${inrRate}`);
    assert(inrOrder.displayTotal && inrOrder.displayTotal.includes('₹'), `Order displayTotal correctly formatted with ₹ (${inrOrder.displayTotal})`);
    assert(typeof inrOrder.baseTotalUSD === 'number' && inrOrder.baseTotalUSD > 0, `Base USD total preserved ($${inrOrder.baseTotalUSD})`);

    // 6. Verify User Orders Retrieval preserves currency
    console.log('\n--- TEST 6: Retrieve User Orders & Verify Currency Persistence ---');
    const myOrdersRes = await makeRequest('/api/orders', { headers: authHeaders });
    assert(myOrdersRes.status === 200, 'GET /api/orders returns HTTP 200');
    const latestOrder = myOrdersRes.data.orders[0];
    assert(latestOrder.currency === 'INR', 'Retrieved order preserves INR currency');
    assert(latestOrder.displayTotal.includes('₹'), 'Retrieved order preserves ₹ display total');

    // 7. Verify Mathematical Conversions across Key Currencies
    console.log('\n--- TEST 7: Multi-Currency Mathematical Integrity ---');
    const baseAmountUSD = 100;
    
    // INR
    const convertedINR = baseAmountUSD * ratesRes.data.rates.INR;
    assert(convertedINR >= 8000, `$100 USD converts to ₹${convertedINR.toFixed(2)} INR`);
    
    // EUR
    const convertedEUR = baseAmountUSD * ratesRes.data.rates.EUR;
    assert(convertedEUR > 0 && convertedEUR < 120, `$100 USD converts to €${convertedEUR.toFixed(2)} EUR`);

    // GBP
    const convertedGBP = baseAmountUSD * ratesRes.data.rates.GBP;
    assert(convertedGBP > 0 && convertedGBP < 100, `$100 USD converts to £${convertedGBP.toFixed(2)} GBP`);

    // JPY
    const convertedJPY = Math.round(baseAmountUSD * ratesRes.data.rates.JPY);
    assert(convertedJPY >= 14000, `$100 USD converts to ¥${convertedJPY} JPY (no decimals)`);

    // Summary
    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log('====================================================\n');

    if (passed === total) {
      console.log('🎉 ALL CURRENCY SYSTEM & CONVERSION TESTS PASSED PERFECTLY!\n');
    } else {
      console.log('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runCurrencyTests();
