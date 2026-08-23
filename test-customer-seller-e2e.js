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

async function runCustomerSellerE2E() {
  console.log('========================================================================');
  console.log('🛍️ COMPLETE CUSTOMER-TO-SELLER-TO-CUSTOMER E2E AUDIT');
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
    // ------------------------------------------------------------------------
    // PART 1: CUSTOMER ORDER PURCHASE FLOW
    // ------------------------------------------------------------------------
    console.log('--- 1. CUSTOMER AUTHENTICATION & MARKETPLACE BROWSING ---');
    const custLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'customer' });
    assert(custLogin.status === 200 && custLogin.data.token, 'Customer logged in (Alex Mercer)');
    const customerAuth = { 'Authorization': `Bearer ${custLogin.data.token}` };

    const productsRes = await makeRequest('/api/products');
    assert(productsRes.status === 200 && productsRes.data.products.length > 0, 'Customer browses marketplace catalog');
    
    // Pick product belonging to Apex Tech Labs (sel_01)
    const product = productsRes.data.products.find(p => p.sellerId === 'sel_01') || productsRes.data.products[0];
    const targetSellerId = product.sellerId;
    console.log(`  Selected product: "${product.name}" ($${product.price}) from Seller: ${targetSellerId}`);

    // Fetch product details
    const prodDetails = await makeRequest(`/api/products/${product.id}`);
    assert(prodDetails.status === 200 && prodDetails.data.product.id === product.id, 'Customer opens product detail page');

    // Add to Cart
    console.log('\n--- 2. ADD TO CART & CART SYNC ---');
    const addToCartRes = await makeRequest('/api/cart/add', {
      method: 'POST',
      headers: customerAuth
    }, {
      productId: product.id,
      quantity: 2,
      variant: product.variants?.[0]?.value || null
    });
    assert(addToCartRes.status === 200, 'Product added to cart (Quantity: 2)');

    // Open Cart
    const cartRes = await makeRequest('/api/cart', { headers: customerAuth });
    assert(cartRes.status === 200 && cartRes.data.items.length > 0, 'Cart opened and items retrieved');
    const cartItem = cartRes.data.items.find(i => i.productId === product.id);
    assert(cartItem && cartItem.quantity >= 2, 'Cart contains active product with quantity >= 2');

    // Add / Select Shipping Address
    console.log('\n--- 3. CHECKOUT & SHIPPING ADDRESS SELECTION ---');
    const newAddressPayload = {
      fullName: 'Alexandre Mercer',
      phone: '+1 (555) 777-8899',
      street: '742 Market Street, Penthouse 4B',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94103',
      country: 'USA',
      type: 'Home',
      isDefault: true
    };
    const addAddressRes = await makeRequest('/api/addresses', {
      method: 'POST',
      headers: customerAuth
    }, newAddressPayload);
    assert(addAddressRes.status === 201 && addAddressRes.data.address.id, 'Shipping address entered and saved');
    const shippingAddress = addAddressRes.data.address;

    // Place Order with Cash on Delivery
    console.log('\n--- 4. PLACE CASH ON DELIVERY (COD) ORDER ---');
    const subtotal = product.price * 2;
    const shippingFee = subtotal > 50 ? 0 : 9.99;
    const tax = +(subtotal * 0.08).toFixed(2);
    const totalAmount = +(subtotal + shippingFee + tax).toFixed(2);

    const placeOrderPayload = {
      items: [
        {
          id: cartItem.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 2,
          image: product.images?.[0],
          variant: cartItem.variant || null,
          sellerId: targetSellerId
        }
      ],
      shippingAddress,
      paymentMethod: 'Cash on Delivery',
      deliverySpeed: 'standard',
      currency: 'INR',
      exchangeRate: 86.5,
      displayTotal: `₹${(totalAmount * 86.5).toFixed(2)}`
    };

    const createOrderRes = await makeRequest('/api/orders/create', {
      method: 'POST',
      headers: customerAuth
    }, placeOrderPayload);

    assert(createOrderRes.status === 201, 'Order created successfully with HTTP 201');
    const createdOrder = createOrderRes.data.order;
    assert(createdOrder.orderNumber.startsWith('MKZ-'), `Order Number assigned: #${createdOrder.orderNumber}`);
    assert(createdOrder.orderStatus === 'Pending', 'Order initialized as "Pending" (awaiting seller confirmation)');
    assert(createdOrder.paymentStatus === 'pending', 'Payment status is "pending" (PAYMENT PENDING / COD)');
    assert(createdOrder.currency === 'INR' && createdOrder.displayTotal.includes('₹'), 'Display total formatted in local currency (₹ INR)');

    // ------------------------------------------------------------------------
    // PART 2: SELLER DASHBOARD FULFILLMENT WORKFLOW
    // ------------------------------------------------------------------------
    console.log('\n--- 5. SELLER LOGIN & DASHBOARD ORDER RETRIEVAL ---');
    const sellerLogin = await makeRequest('/api/auth/demo-login', { method: 'POST' }, { role: 'seller' });
    assert(sellerLogin.status === 200 && sellerLogin.data.token, 'Seller logged in (Apex Tech Labs)');
    const sellerAuth = { 'Authorization': `Bearer ${sellerLogin.data.token}` };

    const sellerOrdersRes = await makeRequest('/api/seller/orders', { headers: sellerAuth });
    assert(sellerOrdersRes.status === 200, 'GET /api/seller/orders returns HTTP 200');
    const sellerOrder = sellerOrdersRes.data.orders.find(o => o.id === createdOrder.id);
    assert(sellerOrder !== undefined, 'Seller receives the newly created customer order in "Customer Orders" tab');
    assert(sellerOrder.orderNumber === createdOrder.orderNumber, `Seller sees correct Order ID: #${sellerOrder.orderNumber}`);
    assert(sellerOrder.shippingAddress?.fullName === 'Alexandre Mercer', `Seller sees Customer: ${sellerOrder.shippingAddress?.fullName}`);
    assert(sellerOrder.items[0]?.name === product.name, `Seller sees Product: "${sellerOrder.items[0]?.name}"`);
    assert(sellerOrder.items[0]?.quantity === 2, `Seller sees Quantity: ${sellerOrder.items[0]?.quantity}`);
    assert(sellerOrder.shippingAddress?.street.includes('Market Street'), `Seller sees Shipping Address: ${sellerOrder.shippingAddress?.street}`);
    assert(sellerOrder.paymentMethod === 'Cash on Delivery', 'Seller sees Payment Method: Cash on Delivery');
    assert(sellerOrder.paymentStatus === 'pending', 'Seller sees Payment Status: pending (Payment Pending / COD)');
    assert(sellerOrder.orderStatus === 'Pending', 'Seller sees Initial Status: Pending');

    // Seller Workflow Step 1: Pending -> Confirmed
    console.log('\n--- 6. SELLER STEP 1: CONFIRM ORDER (PENDING -> CONFIRMED) ---');
    const confirmRes = await makeRequest(`/api/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Confirmed' });
    assert(confirmRes.status === 200 && confirmRes.data.order.orderStatus === 'Confirmed', 'Seller confirms order (Status: Confirmed)');

    // Seller Workflow Step 2: Confirmed -> Processing
    console.log('\n--- 7. SELLER STEP 2: START PROCESSING (CONFIRMED -> PROCESSING) ---');
    const processRes = await makeRequest(`/api/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Processing' });
    assert(processRes.status === 200 && processRes.data.order.orderStatus === 'Processing', 'Seller starts processing (Status: Processing)');

    // Seller Workflow Step 3: Processing -> Shipped
    console.log('\n--- 8. SELLER STEP 3: MARK AS SHIPPED (PROCESSING -> SHIPPED) ---');
    const shipRes = await makeRequest(`/api/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Shipped', note: 'Dispatched via Marketzo Express Priority Courier tracking #MKZ-TRACK-7718' });
    assert(shipRes.status === 200 && shipRes.data.order.orderStatus === 'Shipped', 'Seller dispatches order (Status: Shipped)');

    // ------------------------------------------------------------------------
    // PART 3: CUSTOMER RETURNS TO MY ORDERS
    // ------------------------------------------------------------------------
    console.log('\n--- 9. CUSTOMER VERIFIES SYNCHRONIZED SHIPMENT TIMELINE ---');
    const customerOrdersRes = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    assert(customerOrdersRes.status === 200, 'GET /api/orders/my-orders returns HTTP 200');
    const customerViewOrder = customerOrdersRes.data.orders.find(o => o.id === createdOrder.id);
    assert(customerViewOrder !== undefined, 'Customer finds order in My Orders');
    assert(customerViewOrder.orderStatus === 'Shipped', 'Customer sees live synchronized status: "Shipped"');
    assert(customerViewOrder.timeline.length >= 4, `Customer timeline contains all milestones (Entries: ${customerViewOrder.timeline.length})`);
    assert(customerViewOrder.paymentStatus === 'pending', 'COD payment status correctly remains "pending" while in transit');

    // Final fulfillment step: Out for Delivery -> Delivered (Cash Collected)
    console.log('\n--- 10. FINAL DELIVERY & COD PAYMENT SETTLEMENT ---');
    await makeRequest(`/api/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Out for Delivery' });

    const deliverRes = await makeRequest(`/api/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: sellerAuth
    }, { status: 'Delivered' });
    assert(deliverRes.status === 200 && deliverRes.data.order.orderStatus === 'Delivered', 'Seller marks order as Delivered');
    assert(deliverRes.data.order.paymentStatus === 'paid', 'COD paymentStatus transitioned from "pending" to "paid" upon delivery collection');

    // Customer final verification
    const finalCustOrders = await makeRequest('/api/orders/my-orders', { headers: customerAuth });
    const finalCustOrder = finalCustOrders.data.orders.find(o => o.id === createdOrder.id);
    assert(finalCustOrder.orderStatus === 'Delivered', 'Customer sees "Delivered" state');
    assert(finalCustOrder.paymentStatus === 'paid', 'Customer invoice and order reflects "Paid in Full"');

    // Summary
    console.log('\n========================================================================');
    console.log(`📊 END-TO-END AUDIT RESULT: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 COMPLETE CUSTOMER-TO-SELLER-TO-CUSTOMER WORKFLOW VERIFIED 100%!\n');
    } else {
      console.log('⚠️ TEST AUDIT HAD FAILURES.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runCustomerSellerE2E();
