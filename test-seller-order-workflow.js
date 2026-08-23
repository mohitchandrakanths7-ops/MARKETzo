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

async function runSellerOrderWorkflowTests() {
  console.log('========================================================================');
  console.log('📦 TESTING MARKETZO SELLER ORDER CONFIRMATION & FULFILLMENT WORKFLOW');
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
    // 1. Authenticate Customer, Seller, and Admin
    console.log('--- 1. AUTHENTICATE USERS ---');
    const customerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'customer' });
    assert(customerLogin.status === 200 && customerLogin.data.token, 'Customer authenticated');
    const customerAuth = { 'Authorization': `Bearer ${customerLogin.data.token}` };

    const sellerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'seller' });
    assert(sellerLogin.status === 200 && sellerLogin.data.token, 'Seller authenticated');
    const sellerAuth = { 'Authorization': `Bearer ${sellerLogin.data.token}` };

    const adminLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'admin' });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin authenticated');
    const adminAuth = { 'Authorization': `Bearer ${adminLogin.data.token}` };

    // 2. Fetch products
    console.log('\n--- 2. FETCH PRODUCTS FOR WORKFLOW TEST ---');
    const prodRes = await makeRequest('/api/products');
    assert(prodRes.status === 200 && prodRes.data.products.length >= 2, 'Products catalog retrieved');
    const prod1 = prodRes.data.products.find(p => p.sellerId === sellerLogin.data.seller?.id) || prodRes.data.products[0];
    const prod2 = prodRes.data.products.find(p => p.sellerId !== sellerLogin.data.seller?.id) || prodRes.data.products[1];

    // 3. Customer places a COD order
    console.log('\n--- 3. CUSTOMER PLACES NEW COD ORDER ---');
    const orderPayload = {
      items: [
        {
          id: prod1.id,
          productId: prod1.id,
          name: prod1.name,
          price: prod1.price,
          quantity: 2,
          image: prod1.images?.[0]
        }
      ],
      shippingAddress: {
        fullName: 'Alexandre Mercer',
        phone: '+1 (555) 777-8899',
        street: '742 Market Street, Penthouse 4B',
        city: 'San Francisco',
        state: 'CA',
        pincode: '94103',
        country: 'USA'
      },
      paymentMethod: 'Cash on Delivery',
      deliverySpeed: 'express',
      currency: 'USD',
      exchangeRate: 1.0,
      displayTotal: `$${(prod1.price * 2 + 14.99 + (prod1.price * 2 * 0.08)).toFixed(2)}`
    };

    const createOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: customerAuth
    }, orderPayload);

    assert(createOrderRes.status === 201, 'Customer placed order with HTTP 201');
    const order = createOrderRes.data.order;
    assert(order.orderStatus === 'Pending', 'New order is initialized with status "Pending"');
    assert(order.paymentStatus === 'pending', 'COD order paymentStatus is "pending"');

    // 4. Authorization check: Customer cannot mutate seller order status
    console.log('\n--- 4. TEST AUTHORIZATION SECURITY ---');
    const unauthorizedAttempt = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: customerAuth
    }, { status: 'Delivered' });
    assert(unauthorizedAttempt.status === 403, 'Customer status update attempt blocked with HTTP 403 Forbidden');

    // 5. Seller receives order in Seller Dashboard with all required metadata
    console.log('\n--- 5. SELLER RECEIVES ORDER IN DASHBOARD ---');
    const sellerOrdersRes = await makeRequest('/api/seller/orders', { headers: sellerAuth });
    assert(sellerOrdersRes.status === 200, 'GET /api/seller/orders returns HTTP 200');
    const incomingOrder = sellerOrdersRes.data.orders.find(o => o.id === order.id);
    assert(incomingOrder !== undefined, 'Incoming customer order appears in seller orders list');
    assert(incomingOrder.orderNumber.startsWith('MKZ-'), 'Order contains Order Number');
    assert(incomingOrder.shippingAddress?.fullName === 'Alexandre Mercer', 'Order contains Customer Full Name');
    assert(incomingOrder.shippingAddress?.phone === '+1 (555) 777-8899', 'Order contains Customer Phone');
    assert(incomingOrder.shippingAddress?.street.includes('Market Street'), 'Order contains Shipping Address for fulfillment');
    assert(incomingOrder.items.length === 1 && incomingOrder.items[0].quantity === 2, 'Order contains Products and Quantities');
    assert(incomingOrder.paymentMethod === 'Cash on Delivery', 'Order contains Payment Method');
    assert(incomingOrder.paymentStatus === 'pending', 'Order contains Payment Status (pending)');
    assert(incomingOrder.orderStatus === 'Pending', 'Order contains Current Order Status (Pending)');

    // 6. Workflow Validation: Invalid leaps are blocked for sellers
    console.log('\n--- 6. TEST SEQUENTIAL WORKFLOW VALIDATION (INVALID SKIPS BLOCKED) ---');
    const invalidSkip1 = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Delivered' });
    assert(invalidSkip1.status === 400, 'Seller skip from Pending -> Delivered is blocked with HTTP 400');

    const invalidSkip2 = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Shipped' });
    assert(invalidSkip2.status === 400, 'Seller skip from Pending -> Shipped is blocked with HTTP 400');

    // 7. Step 1: Seller Confirms Order (Pending -> Confirmed)
    console.log('\n--- 7. STEP 1: SELLER CONFIRMS ORDER ---');
    const confirmRes = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Confirmed' });
    assert(confirmRes.status === 200, 'Seller confirmed order with HTTP 200');
    assert(confirmRes.data.order.orderStatus === 'Confirmed', 'Order status is now "Confirmed"');
    assert(confirmRes.data.order.paymentStatus === 'pending', 'COD payment status remains "pending" after confirmation');

    // Verify Customer sees Confirmed
    const customerMyOrders1 = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    const custOrder1 = customerMyOrders1.data.orders.find(o => o.id === order.id);
    assert(custOrder1.orderStatus === 'Confirmed', 'Customer My Orders immediately shows "Confirmed"');

    // 8. Step 2: Seller Starts Processing (Confirmed -> Processing)
    console.log('\n--- 8. STEP 2: SELLER STARTS PROCESSING ---');
    const processRes = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Processing' });
    assert(processRes.status === 200, 'Seller moved order to Processing with HTTP 200');
    assert(processRes.data.order.orderStatus === 'Processing', 'Order status is now "Processing"');

    // 9. Step 3: Seller Marks as Shipped (Processing -> Shipped)
    console.log('\n--- 9. STEP 3: SELLER MARKS AS SHIPPED ---');
    const shipRes = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Shipped' });
    assert(shipRes.status === 200, 'Seller marked order as Shipped with HTTP 200');
    assert(shipRes.data.order.orderStatus === 'Shipped', 'Order status is now "Shipped"');

    // 10. Step 4: Seller Marks Out for Delivery (Shipped -> Out for Delivery)
    console.log('\n--- 10. STEP 4: SELLER MARKS OUT FOR DELIVERY ---');
    const outForDeliveryRes = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Out for Delivery' });
    assert(outForDeliveryRes.status === 200, 'Seller marked order Out for Delivery with HTTP 200');
    assert(outForDeliveryRes.data.order.orderStatus === 'Out for Delivery', 'Order status is now "Out for Delivery"');

    // 11. Step 5: Seller Marks Delivered (Out for Delivery -> Delivered)
    console.log('\n--- 11. STEP 5: SELLER MARKS DELIVERED & COLLECTS COD ---');
    const deliverRes = await makeRequest(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Delivered' });
    assert(deliverRes.status === 200, 'Seller marked order Delivered with HTTP 200');
    assert(deliverRes.data.order.orderStatus === 'Delivered', 'Order status is now "Delivered"');
    assert(deliverRes.data.order.paymentStatus === 'paid', 'COD payment status automatically updated to "paid" upon delivery');

    // Verify Customer sees Delivered and Paid in Full
    const customerMyOrders2 = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    const custOrder2 = customerMyOrders2.data.orders.find(o => o.id === order.id);
    assert(custOrder2.orderStatus === 'Delivered', 'Customer My Orders shows "Delivered"');
    assert(custOrder2.paymentStatus === 'paid', 'Customer My Orders shows "paid"');

    // 12. Multi-Seller Scoping
    console.log('\n--- 12. MULTI-SELLER ORDER SCOPING ---');
    const multiSellerOrderPayload = {
      items: [
        {
          id: prod1.id,
          productId: prod1.id,
          name: prod1.name,
          price: prod1.price,
          quantity: 1,
          sellerId: prod1.sellerId
        },
        {
          id: prod2.id,
          productId: prod2.id,
          name: prod2.name,
          price: prod2.price,
          quantity: 1,
          sellerId: prod2.sellerId
        }
      ],
      shippingAddress: {
        fullName: 'Multi-Vendor Buyer',
        phone: '+1 (555) 123-4567',
        street: '100 Multi Vendor Way',
        city: 'Seattle',
        state: 'WA',
        pincode: '98101',
        country: 'USA'
      },
      paymentMethod: 'Instant UPI / QR (shopper@upi)',
      deliverySpeed: 'standard',
      currency: 'USD',
      exchangeRate: 1.0,
      displayTotal: `$${(prod1.price + prod2.price + 9.99).toFixed(2)}`
    };

    const multiOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: customerAuth
    }, multiSellerOrderPayload);

    assert(multiOrderRes.status === 201, 'Multi-seller order placed');
    const multiOrder = multiOrderRes.data.order;

    // Seller 1 fetches orders: should only see items for seller 1
    const s1OrdersRes = await makeRequest('/api/seller/orders', { headers: sellerAuth });
    const s1Order = s1OrdersRes.data.orders.find(o => o.id === multiOrder.id);
    assert(s1Order !== undefined, 'Seller 1 receives multi-seller order');
    assert(s1Order.items.length === 1 && s1Order.items[0].productId === prod1.id, 'Seller 1 only sees their own product in items array');

    // Summary
    console.log('\n========================================================================');
    console.log(`📊 SELLER ORDER WORKFLOW AUDIT: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL SELLER CONFIRMATION WORKFLOW TESTS PASSED PERFECTLY!\n');
    } else {
      console.log('⚠️ SOME TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runSellerOrderWorkflowTests();
