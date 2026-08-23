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

async function runPaymentStatusTests() {
  console.log('========================================================================');
  console.log('💳 TESTING MARKETZO INVOICE & ORDER PAYMENT STATUS LOGIC');
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
    // 1. Authenticate Customer & Seller
    console.log('--- 1. AUTHENTICATE CUSTOMER & SELLER ---');
    const customerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'customer' });
    assert(customerLogin.status === 200 && customerLogin.data.token, 'Customer logged in');
    const customerAuth = { 'Authorization': `Bearer ${customerLogin.data.token}` };

    const sellerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'seller' });
    assert(sellerLogin.status === 200 && sellerLogin.data.token, 'Seller logged in');
    const sellerAuth = { 'Authorization': `Bearer ${sellerLogin.data.token}` };

    // 2. Fetch an available product
    console.log('\n--- 2. FETCH PRODUCT CATALOG FOR ORDERS ---');
    const prodRes = await makeRequest('/api/products?limit=5');
    assert(prodRes.status === 200 && prodRes.data.products.length > 0, 'Catalog products retrieved');
    const product = prodRes.data.products[0];

    // 3. Place Online UPI / Card Payment Order
    console.log('\n--- 3. TEST ONLINE UPI / CARD PAYMENT ORDER ---');
    const onlineOrderPayload = {
      items: [
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images?.[0]
        }
      ],
      shippingAddress: {
        fullName: 'Alex Mercer',
        phone: '+91 98765 43210',
        street: '42 Marine Drive',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400020',
        country: 'India'
      },
      paymentMethod: 'Instant UPI / QR (alex@marketzo)',
      deliverySpeed: 'standard',
      currency: 'INR',
      exchangeRate: 86.5,
      displayTotal: `₹${(product.price * 86.5).toFixed(2)}`
    };

    const onlineOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: customerAuth
    }, onlineOrderPayload);

    if (onlineOrderRes.status !== 201) {
      console.log('DEBUG onlineOrderRes:', onlineOrderRes);
    }

    assert(onlineOrderRes.status === 201, 'Online order created with HTTP 201');
    const onlineOrder = onlineOrderRes.data?.order || {};
    assert(onlineOrder.paymentMethod === 'Instant UPI / QR (alex@marketzo)', 'Online order paymentMethod recorded');
    assert(onlineOrder.paymentStatus === 'paid', 'Online order paymentStatus initialized to "paid"');
    assert(onlineOrder.currency === 'INR' && onlineOrder.displayTotal.includes('₹'), 'Online order formatted in INR (₹)');

    // 4. Place Cash on Delivery (COD) Order
    console.log('\n--- 4. TEST CASH ON DELIVERY (COD) ORDER (BEFORE DELIVERY) ---');
    const codOrderPayload = {
      items: [
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images?.[0]
        }
      ],
      shippingAddress: {
        fullName: 'Alex Mercer',
        phone: '+91 98765 43210',
        street: '42 Marine Drive',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400020',
        country: 'India'
      },
      paymentMethod: 'Cash on Delivery',
      deliverySpeed: 'standard',
      currency: 'INR',
      exchangeRate: 86.5,
      displayTotal: `₹${(product.price * 86.5).toFixed(2)}`
    };

    const codOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: customerAuth
    }, codOrderPayload);

    assert(codOrderRes.status === 201, 'COD order created with HTTP 201');
    const codOrder = codOrderRes.data.order;
    assert(codOrder.paymentMethod === 'Cash on Delivery', 'COD order paymentMethod is "Cash on Delivery"');
    assert(codOrder.paymentStatus === 'pending', 'COD order paymentStatus initialized to "pending" (Payment Pending / COD)');
    assert(codOrder.currency === 'INR' && codOrder.displayTotal.includes('₹'), 'COD order formatted in INR (₹)');

    // 5. Verify Customer My Orders & Invoice data for COD (Pending State)
    console.log('\n--- 5. VERIFY CUSTOMER ORDER RETRIEVAL FOR COD ---');
    const myOrdersRes = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    assert(myOrdersRes.status === 200, 'GET /api/orders/my-orders returns 200');
    const retrievedCODOrder = myOrdersRes.data.orders.find(o => o.id === codOrder.id);
    assert(retrievedCODOrder && retrievedCODOrder.paymentStatus === 'pending', 'Retrieved COD order preserves paymentStatus: "pending"');

    // 6. Verify Seller Dashboard receives COD order with pending status
    console.log('\n--- 6. VERIFY SELLER DASHBOARD ORDER LISTING ---');
    const sellerOrdersRes = await makeRequest('/api/seller/orders', { headers: sellerAuth });
    assert(sellerOrdersRes.status === 200, 'GET /api/seller/orders returns 200');
    const sellerCODOrder = sellerOrdersRes.data.orders.find(o => o.id === codOrder.id);
    assert(sellerCODOrder && sellerCODOrder.paymentStatus === 'pending', 'Seller sees COD order with paymentStatus: "pending"');

    // 7. Update COD Order Milestone to "Delivered" -> Verify Automatic Payment Collection
    console.log('\n--- 7. SELLER FULFILLS & DELIVERS COD ORDER (COLLECT PAYMENT) ---');
    const deliverRes = await makeRequest(`/api/orders/${codOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, {
      status: 'Delivered',
      note: 'Package handed to customer. Cash on Delivery payment collected in full at doorstep.'
    });

    assert(deliverRes.status === 200, 'Order marked as Delivered with HTTP 200');
    const deliveredOrder = deliverRes.data.order;
    assert(deliveredOrder.orderStatus === 'Delivered', 'Order status is "Delivered"');
    assert(deliveredOrder.paymentStatus === 'paid', 'COD order paymentStatus transitioned from "pending" to "paid" upon delivery');

    // 8. Verify Customer Invoice reflecting "PAID IN FULL" post-delivery
    console.log('\n--- 8. VERIFY CUSTOMER INVOICE & ORDER AFTER DELIVERY ---');
    const postDeliveryOrders = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    const finalizedOrder = postDeliveryOrders.data.orders.find(o => o.id === codOrder.id);
    assert(finalizedOrder.paymentStatus === 'paid', 'Finalized customer order has paymentStatus: "paid"');
    assert(finalizedOrder.orderStatus === 'Delivered', 'Finalized customer order has orderStatus: "Delivered"');

    // Summary
    console.log('\n========================================================================');
    console.log(`📊 PAYMENT STATUS AUDIT: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL INVOICE & ORDER PAYMENT STATUS LOGIC PASSED PERFECTLY!\n');
    } else {
      console.log('⚠️ SOME TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runPaymentStatusTests();
