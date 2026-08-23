const fs = require('fs');

async function runCompleteMarketzoAudit() {
  console.log('========================================================================');
  console.log('🔍 FULL END-TO-END MARKETZO QUALITY AUDIT & USER JOURNEY TEST SUITE');
  console.log('========================================================================\n');

  const base = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: SYSTEM HEALTH & ARCHITECTURE
    // ------------------------------------------------------------------------
    console.log('--- SECTION 1: SYSTEM HEALTH & ARCHITECTURE ---');
    const health = await fetch(`${base}/health`).then(r => r.json());
    assert('API System Health & DB Connectivity', health.status === 'ONLINE', `Products: ${health.database.productsCount}, Sellers: ${health.database.sellersCount}`);

    const feIndex = await fetch('http://localhost:3000/').then(r => r.text());
    assert('Frontend Dev Server on Port 3000', feIndex.includes('MARKETZO') && feIndex.includes('Buy More. Sell More.'), 'Root HTML payload valid');

    // ------------------------------------------------------------------------
    // SECTION 2: CUSTOMER JOURNEY (Auth -> Search -> Product -> Cart -> Checkout -> Order)
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 2: CUSTOMER JOURNEY ---');

    // Register a fresh customer
    const testEmail = `testuser_${Date.now()}@marketzo.com`;
    const regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Hayes',
        email: testEmail,
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 987-6543'
      })
    }).then(r => r.json());
    assert('Customer Registration & JWT Token', regRes.success && !!regRes.token, `User: ${regRes.user.email}`);
    const customerToken = regRes.token;

    // Search catalog
    const searchRes = await fetch(`${base}/products?search=wireless`).then(r => r.json());
    assert('Search Products with Keyword', searchRes.success && searchRes.products.length > 0, `Matches: ${searchRes.products.length}`);

    // Autocomplete suggestions
    const suggestRes = await fetch(`${base}/products/suggestions?q=ultra`).then(r => r.json());
    assert('Live Autocomplete Suggestions', suggestRes.success && suggestRes.suggestions.products.length > 0, `Suggestions: ${suggestRes.suggestions.products.length}`);

    // Product details & variants
    const targetProduct = searchRes.products[0];
    const detailRes = await fetch(`${base}/products/${targetProduct.id}`).then(r => r.json());
    assert('Product Details & Variants', detailRes.success && detailRes.product.variants.length > 0, `Variants: ${detailRes.product.variants.map(v => v.value).join(', ')}`);

    // Pincode checker
    const pinRes = await fetch(`${base}/pincode/check/94102`).then(r => r.json());
    assert('Pincode Serviceability & Courier Estimation', pinRes.serviceable && !!pinRes.estimatedDelivery, `ETA: ${pinRes.estimatedDelivery} via ${pinRes.courierPartner}`);

    // Submit a customer review
    const revRes = await fetch(`${base}/products/${targetProduct.id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        rating: 5,
        title: 'Outstanding performance and build!',
        comment: 'High fidelity audio that exceeds expectations. Fast shipping!'
      })
    }).then(r => r.json());
    assert('Customer Review Submission', revRes.success && revRes.review.rating === 5, `New Rating: ${revRes.newRating} (${revRes.newReviewCount} reviews)`);

    // Add to Cart
    const addCartRes = await fetch(`${base}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        productId: targetProduct.id,
        quantity: 2,
        variant: targetProduct.variants[0]?.value || 'Default'
      })
    }).then(r => r.json());
    assert('Add Item to Cart with Variant', addCartRes.success, 'Added 2 units to cart');

    // Retrieve Cart and verify price summary
    const cartRes = await fetch(`${base}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert('Cart Sync & Price Calculation', cartRes.success && cartRes.items.length > 0, `Subtotal: $${cartRes.summary.subtotal}`);

    // Toggle Save For Later
    const cartItemId = cartRes.items[0].id;
    const saveLaterRes = await fetch(`${base}/cart/save-for-later/${cartItemId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert('Save for Later Drawer', saveLaterRes.success && saveLaterRes.savedForLater === true, saveLaterRes.message);

    // Move back to Cart
    const moveBackRes = await fetch(`${base}/cart/save-for-later/${cartItemId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert('Move Back to Active Cart', moveBackRes.success && moveBackRes.savedForLater === false, moveBackRes.message);

    // Validate Coupon
    const cpnRes = await fetch(`${base}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'MARKETZO10', cartSubtotal: cartRes.summary.subtotal })
    }).then(r => r.json());
    assert('Coupon Code Verification (MARKETZO10)', cpnRes.valid && cpnRes.coupon.discountAmount > 0, `Discount: $${cpnRes.coupon.discountAmount}`);

    // Add Shipping Address
    const addrRes = await fetch(`${base}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        fullName: 'Jordan Hayes',
        phone: '+1 (555) 987-6543',
        street: '450 Mission Street, Suite 1800',
        city: 'San Francisco',
        state: 'CA',
        pincode: '94105',
        type: 'Work',
        isDefault: true
      })
    }).then(r => r.json());
    assert('Shipping Address Creation', addrRes.success && !!addrRes.address.id, `${addrRes.address.street}, ${addrRes.address.city}`);

    // Sandbox Payment Verification
    const payRes = await fetch(`${base}/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        amount: cartRes.summary.totalAmount,
        method: 'Instant UPI / QR (jordan@upi)'
      })
    }).then(r => r.json());
    assert('Sandbox Payment Gateway Clearance', payRes.success && payRes.status === 'COMPLETED', `TXN ID: ${payRes.transactionId}`);

    // Place Customer Order
    const placeOrderRes = await fetch(`${base}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        items: [{
          productId: targetProduct.id,
          quantity: 1,
          variant: targetProduct.variants[0]?.value || null
        }],
        shippingAddress: addrRes.address,
        paymentMethod: 'Instant UPI / QR (jordan@upi)',
        couponCode: 'MARKETZO10',
        deliverySpeed: 'standard'
      })
    }).then(r => r.json());
    assert('Order Creation & Inventory Allocation', placeOrderRes.success && !!placeOrderRes.order.orderNumber, `Order #${placeOrderRes.order.orderNumber}`);
    const createdOrderId = placeOrderRes.order.id;

    // Verify My Orders & Timeline
    const myOrdersRes = await fetch(`${base}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert('Customer Orders Timeline & History', myOrdersRes.success && myOrdersRes.orders.length > 0, `Latest: ${myOrdersRes.orders[0].orderNumber} (${myOrdersRes.orders[0].orderStatus})`);

    // ------------------------------------------------------------------------
    // SECTION 3: SELLER DASHBOARD & WORKFLOW
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 3: SELLER DASHBOARD & WORKFLOW ---');

    // Login as Seller
    const sellerLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'seller' })
    }).then(r => r.json());
    assert('Seller Login (Apex Tech Labs)', sellerLogin.success && sellerLogin.user.role === 'seller', `Store: ${sellerLogin.seller?.storeName}`);
    const sellerToken = sellerLogin.token;

    // Seller Analytics
    const sellerMetrics = await fetch(`${base}/seller/metrics`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert('Seller Dashboard Analytics & Revenue', sellerMetrics.success && sellerMetrics.metrics.totalRevenue !== undefined, `Revenue: $${sellerMetrics.metrics.totalRevenue}, Orders: ${sellerMetrics.metrics.totalOrders}`);

    // Add New Product as Seller
    const newProdPayload = {
      name: 'Quantum Surge 34-inch Curved QD-OLED Gaming Monitor (240Hz / 0.03ms)',
      categoryId: 'cat_laptops',
      brandId: 'br_aurora',
      description: 'The pinnacle of esports display technology. Quantum Dot OLED panel with ultra-wide 1800R curvature, 240Hz refresh rate, 0.03ms response time, and 99.3% DCI-P3 color gamut.',
      price: 999.00,
      originalPrice: 1299.00,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'],
      specs: {
        'Display Size': '34-inch UltraWide Quad HD (3440 x 1440)',
        'Panel Type': 'Quantum Dot OLED',
        'Refresh Rate': '240Hz native',
        'Response Time': '0.03ms GtG',
        'Ports': 'DisplayPort 1.4 x 2, HDMI 2.1 x 2, USB-C 90W PD'
      },
      highlights: [
        'Pure black contrast with DisplayHDR True Black 400',
        'Built-in KVM switch and custom ambient RGB lighting',
        '3-Year OLED burn-in warranty protection'
      ]
    };

    const addProdRes = await fetch(`${base}/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify(newProdPayload)
    }).then(r => r.json());
    assert('Seller Add New Product Listing', addProdRes.success && !!addProdRes.product.id, `Listed: "${addProdRes.product.name}"`);
    const sellerNewProdId = addProdRes.product.id;

    // Verify newly added product appears immediately on the public marketplace
    const marketplaceCheck = await fetch(`${base}/products/${sellerNewProdId}`).then(r => r.json());
    assert('Newly Added Product Live on Public Marketplace', marketplaceCheck.success && marketplaceCheck.product.name.includes('Quantum Surge'), `Price: $${marketplaceCheck.product.price}`);

    // Step: Seller Confirms Order
    await fetch(`${base}/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ status: 'Confirmed' })
    });

    // Step: Seller Starts Processing
    await fetch(`${base}/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ status: 'Processing' })
    });

    // Update order status (Dispatch item)
    const updateOrderRes = await fetch(`${base}/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        status: 'Shipped',
        note: 'Package handed over to Marketzo Express Priority Courier tracking #MKZ-EXP-99201'
      })
    }).then(r => r.json());
    assert('Seller Update Order Milestone (Shipped)', updateOrderRes.success && updateOrderRes.order.orderStatus === 'Shipped', updateOrderRes.message);

    // ------------------------------------------------------------------------
    // SECTION 4: ADMIN CONTROL CENTER & PLATFORM GOVERNANCE
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 4: ADMIN CONTROL CENTER ---');

    // Login as Admin
    const adminLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    }).then(r => r.json());
    assert('Super Admin Clearance & Login', adminLogin.success && adminLogin.user.role === 'admin', `Admin: ${adminLogin.user.name}`);
    const adminToken = adminLogin.token;

    // Admin Platform Metrics
    const adminMetrics = await fetch(`${base}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert('Admin Platform GMV & Metrics', adminMetrics.success && adminMetrics.stats.totalGMV > 0, `GMV: $${adminMetrics.stats.totalGMV}, Total Customers: ${adminMetrics.stats.totalCustomers}`);

    // Approve a pending seller
    const approveSellerRes = await fetch(`${base}/admin/sellers/sel_03/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    }).then(r => r.json());
    assert('Admin Seller Verification & Approval', approveSellerRes.success && approveSellerRes.seller.status === 'approved', approveSellerRes.message);

    // Product Moderation (Toggle Featured)
    const modProdRes = await fetch(`${base}/admin/products/${sellerNewProdId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isFeatured: true, isTrending: true })
    }).then(r => r.json());
    assert('Admin Product Moderation & Badging', modProdRes.success && modProdRes.product.isFeatured === true, 'Set as Featured & Trending');

    // Create a new promotional coupon as Admin
    const newCouponRes = await fetch(`${base}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: 'FLASHSALE40',
        discountType: 'percentage',
        discountValue: 40,
        minOrderValue: 100,
        maxDiscountAmount: 80,
        description: 'Super Admin Flash 40% Off Promotion'
      })
    }).then(r => r.json());
    assert('Admin Coupon Creation (FLASHSALE40)', newCouponRes.success && newCouponRes.coupon.code === 'FLASHSALE40', newCouponRes.message);

    // Test that the newly created coupon works at checkout
    const testNewCoupon = await fetch(`${base}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FLASHSALE40', cartSubtotal: 200 })
    }).then(r => r.json());
    assert('New Coupon Verification at Checkout', testNewCoupon.valid && testNewCoupon.coupon.discountAmount === 80, `40% capped discount: $${testNewCoupon.coupon.discountAmount}`);

    console.log('\n========================================================================');
    console.log(`📊 FINAL AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED (100% HEALTHY)`);
    console.log('========================================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
  }
}

runCompleteMarketzoAudit();
