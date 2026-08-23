const assert = require('assert');

async function testSellerOrdersFlow() {
  console.log('🧪 Starting Seller Customer Orders System Tests...\n');
  const BASE_URL = 'http://localhost:5000/api';

  // 1. Authenticate Seller
  console.log('⏳ 1. Authenticating Demo Seller...');
  const sellerLogin = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'seller' })
  }).then(r => r.json());

  assert.strictEqual(sellerLogin.success, true, 'Seller login failed');
  const sellerToken = sellerLogin.token;
  console.log('✅ Seller authenticated successfully.');

  // 2. Fetch Seller Orders
  console.log('⏳ 2. Fetching Customer Orders (GET /api/seller/orders)...');
  const ordersRes = await fetch(`${BASE_URL}/seller/orders`, {
    headers: { 'Authorization': `Bearer ${sellerToken}` }
  }).then(r => r.json());

  assert.strictEqual(ordersRes.success, true, 'GET /api/seller/orders failed');
  assert.ok(Array.isArray(ordersRes.orders), 'orders should be an array');
  console.log(`✅ Received ${ordersRes.orders.length} customer orders.`);

  // 3. Create a Customer Order if list is empty or to test full workflow
  console.log('⏳ 3. Creating a new Customer Order...');
  const customerLogin = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'customer' })
  }).then(r => r.json());

  // Fetch available products
  const productsRes = await fetch(`${BASE_URL}/products`).then(r => r.json());
  let targetProduct = productsRes.products?.find(p => p.stock > 2);
  if (!targetProduct) {
    // Create new seller product with abundant stock
    const createProd = await fetch(`${BASE_URL}/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'Marketzo Pro ANC Studio Monitor',
        price: 199.99,
        stock: 50,
        categoryId: 'cat_electronics',
        images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80']
      })
    }).then(r => r.json());
    targetProduct = createProd.product;
  }

  const newOrderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerLogin.token}`
    },
    body: JSON.stringify({
      items: [{
        productId: targetProduct.id,
        name: targetProduct.name,
        price: targetProduct.price,
        quantity: 2,
        variant: 'Default Edition'
      }],
      shippingAddress: {
        fullName: 'Jane Doe',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        pincode: '97477',
        country: 'United States',
        phone: '+1 (555) 234-5678'
      },
      paymentMethod: 'Cash on Delivery (COD)'
    })
  }).then(r => r.json());

  assert.strictEqual(newOrderRes.success, true, 'Failed to create test order: ' + (newOrderRes.message || ''));
  const orderId = newOrderRes.order.id;
  console.log(`✅ Order placed with ID: ${orderId}, Order Number: ${newOrderRes.order.orderNumber}`);

  // 4. Verify Seller sees the new order with enriched customer and product data
  console.log('⏳ 4. Verifying order data fields on Seller Orders endpoint...');
  const refreshedOrders = await fetch(`${BASE_URL}/seller/orders`, {
    headers: { 'Authorization': `Bearer ${sellerToken}` }
  }).then(r => r.json());

  const targetOrder = refreshedOrders.orders.find(o => o.id === orderId);
  assert.ok(targetOrder, 'Created order not found in seller orders list');
  assert.ok(targetOrder.orderNumber, 'Missing orderNumber');
  assert.ok(targetOrder.customerName, 'Missing customerName');
  assert.ok(targetOrder.customerPhone, 'Missing customerPhone');
  assert.ok(targetOrder.shippingAddress, 'Missing shippingAddress');
  assert.ok(Array.isArray(targetOrder.items) && targetOrder.items.length > 0, 'Missing order items');
  assert.strictEqual(targetOrder.items[0].quantity, 2, 'Item quantity mismatch');
  console.log('✅ All customer order fields verified successfully.');

  // 5. Test Status Progression Workflow
  const statuses = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  for (const nextStatus of statuses) {
    console.log(`⏳ 5. Transitioning order to "${nextStatus}"...`);
    const updateRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        status: nextStatus,
        note: `Carrier status updated to ${nextStatus}`
      })
    }).then(r => r.json());

    assert.strictEqual(updateRes.success, true, `Failed to update status to ${nextStatus}`);
    assert.strictEqual(updateRes.order.orderStatus, nextStatus, 'Status not reflected');
    console.log(`✅ Order status successfully updated to "${nextStatus}".`);
  }

  // 6. Test Live Shipment Tracking Endpoint
  console.log('⏳ 6. Verifying Live Carrier Tracking endpoint...');
  const trackRes = await fetch(`${BASE_URL}/orders/${orderId}/track`, {
    headers: { 'Authorization': `Bearer ${sellerToken}` }
  }).then(r => r.json());

  assert.strictEqual(trackRes.success, true, 'Failed to fetch shipment tracking');
  assert.strictEqual(trackRes.tracking.currentStatus, 'Delivered', 'Tracking status mismatch');
  console.log('✅ Live Tracking timeline verified.');

  console.log('\n========================================');
  console.log('🎉 ALL SELLER ORDER TESTS PASSED (6/6)');
  console.log('========================================\n');
}

testSellerOrdersFlow().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
