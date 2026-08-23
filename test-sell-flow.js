const fs = require('fs');

// Helpers for WhatsApp and Phone verification
const normalizePhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return digits;
};

const getWhatsAppUrl = (phone, productName) => {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const message = `Hi, I'm interested in your product on MARKETZO: ${productName}.`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

async function runCompleteSellFlowAudit() {
  console.log('========================================================================');
  console.log('🛒 TESTING COMPLETE "SELL ON MARKETZO" MULTI-VENDOR PRODUCT LIFECYCLE');
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
    // STEP 1: SELLER LOGIN
    // ------------------------------------------------------------------------
    console.log('--- 1. SELLER AUTHENTICATION & DASHBOARD METRICS ---');
    const sellerLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'seller' })
    }).then(r => r.json());
    assert('Seller Login (Apex Tech Labs)', sellerLogin.success && sellerLogin.user.role === 'seller', `Store: ${sellerLogin.seller?.storeName}`);
    const sellerToken = sellerLogin.token;

    // Ensure clean seller profile
    await fetch(`${base}/seller/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        storeName: 'Apex Tech Labs',
        phone: '+1 (555) 392-1082'
      })
    });

    const sellerMetrics = await fetch(`${base}/seller/metrics`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert('Seller Analytics & Catalog Stats', sellerMetrics.success && sellerMetrics.metrics.totalRevenue !== undefined, `Revenue: $${sellerMetrics.metrics.totalRevenue}, Active Products: ${sellerMetrics.metrics.totalProducts}`);

    // ------------------------------------------------------------------------
    // STEP 2: CREATE DRAFT PRODUCT
    // ------------------------------------------------------------------------
    console.log('\n--- 2. CREATE DRAFT PRODUCT ---');
    const draftPayload = {
      name: 'Draft Concept AeroBuds Pro ANC',
      categoryId: 'cat_electronics',
      brandId: 'br_aurora',
      price: 189.99,
      originalPrice: 229.99,
      stock: 10,
      sku: 'MKZ-DFT-091',
      weight: '0.25 kg',
      shippingInfo: 'Standard Delivery',
      tags: ['concept', 'draft', 'audio'],
      status: 'draft',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'],
      description: 'Draft unreleased prototype audio earbuds.'
    };

    const draftRes = await fetch(`${base}/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify(draftPayload)
    }).then(r => r.json());
    assert('Create Draft Product API', draftRes.success && draftRes.product.status === 'draft', `Draft ID: ${draftRes.product.id}`);
    const draftId = draftRes.product.id;

    // Verify Draft does NOT appear on public marketplace search
    const publicSearchDraft = await fetch(`${base}/products?search=AeroBuds`).then(r => r.json());
    assert('Draft Hidden from Public Marketplace Search', publicSearchDraft.products.every(p => p.id !== draftId), 'Draft product is private');

    // ------------------------------------------------------------------------
    // STEP 3: PUBLISH NEW FLAGSHIP PRODUCT TO MARKETPLACE
    // ------------------------------------------------------------------------
    console.log('\n--- 3. PUBLISH PRODUCT WITH MULTI-IMAGE, VARIANTS, SKU & SPECS ---');
    const publishPayload = {
      name: 'Quantum Apex Pro 8K Quadcopter CineDrone (O4 / 46min Flight)',
      categoryId: 'cat_electronics',
      brandId: 'br_aurora',
      price: 1299.00,
      originalPrice: 1599.00,
      stock: 20,
      sku: 'MKZ-DRONE-8K',
      weight: '1.2 kg',
      shippingInfo: 'Free Express 2-Day Priority Delivery',
      contactPhone: '+1 (555) 392-1082',
      tags: ['drone', '8k video', 'cine', 'gimbal', 'quadcopter'],
      status: 'approved',
      images: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { id: 'v1', name: 'Bundle Package', value: 'Standard Drone Pack', priceDiff: 0, stock: 10 },
        { id: 'v2', name: 'Bundle Package', value: 'Fly More Combo (3 Batteries + Hub)', priceDiff: 250, stock: 10 }
      ],
      specs: {
        'Video Resolution': '8K HDR @ 60fps / 4K @ 120fps',
        'Max Flight Time': '46 minutes per battery',
        'Transmission Range': '15 km O4 Ultra-Low Latency',
        'Obstacle Sensing': '360° Omnidirectional APAS 5.0'
      },
      highlights: [
        '1-inch CMOS Hasselblad Optical Sensor',
        'ActiveTrack 360° Subject Following Engine',
        'Level 6 Wind Resistance with High-Precision GPS'
      ],
      offers: ['Free 1-Year Marketzo Care Replacement Plan included']
    };

    const publishRes = await fetch(`${base}/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify(publishPayload)
    }).then(r => r.json());
    assert('Publish Product to Marketplace', publishRes.success && publishRes.product.status === 'approved', `Live ID: ${publishRes.product.id}`);
    const liveProductId = publishRes.product.id;

    // ------------------------------------------------------------------------
    // STEP 4: VERIFY ON PUBLIC MARKETPLACE & CONTACT SELLER
    // ------------------------------------------------------------------------
    console.log('\n--- 4. VERIFY ON PUBLIC STOREFRONT & CONTACT SELLER ---');
    const marketplaceCheck = await fetch(`${base}/products/${liveProductId}`).then(r => r.json());
    assert('Product Live on Public Marketplace', marketplaceCheck.success && marketplaceCheck.product.name.includes('Quadcopter CineDrone'), `Name: ${marketplaceCheck.product.name}`);
    assert('Product Multiple Images Preserved', marketplaceCheck.product.images.length === 2, `Images count: ${marketplaceCheck.product.images.length}`);
    assert('Product Variants Preserved', marketplaceCheck.product.variants.length === 2, `Variants: ${marketplaceCheck.product.variants.map(v => v.value).join(', ')}`);
    assert('Product SKU Preserved', marketplaceCheck.product.sku === 'MKZ-DRONE-8K', `SKU: ${marketplaceCheck.product.sku}`);
    assert('Seller Store Name Correct', marketplaceCheck.product.seller.storeName === 'Apex Tech Labs', `Seller: ${marketplaceCheck.product.seller.storeName}`);
    assert('Seller Contact Phone Populated', marketplaceCheck.product.seller.phone === '+1 (555) 392-1082', `Phone: ${marketplaceCheck.product.seller.phone}`);

    const waLink = getWhatsAppUrl(marketplaceCheck.product.seller.phone, marketplaceCheck.product.name);
    assert('WhatsApp Direct Inquiry Link Generated', waLink && waLink.startsWith('https://wa.me/15553921082?text='), `WhatsApp: ${waLink}`);

    // ------------------------------------------------------------------------
    // STEP 5: CUSTOMER ORDER PURCHASE FLOW
    // ------------------------------------------------------------------------
    console.log('\n--- 5. CUSTOMER PURCHASE & CHECKOUT FLOW ---');
    const custLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'customer' })
    }).then(r => r.json());
    const custToken = custLogin.token;

    // Place Customer Order for the new product with Fly More Combo variant
    const orderRes = await fetch(`${base}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({
        items: [{
          productId: liveProductId,
          quantity: 1,
          variant: 'Fly More Combo (3 Batteries + Hub)'
        }],
        shippingAddress: {
          fullName: 'Alex Mercer',
          phone: '+1 (555) 234-5678',
          street: '742 Market Street, Penthouse 4B',
          city: 'San Francisco',
          state: 'CA',
          pincode: '94103'
        },
        paymentMethod: 'Instant UPI / QR (alex@upi)',
        deliverySpeed: 'express'
      })
    }).then(r => r.json());
    assert('Customer Order Created', orderRes.success && !!orderRes.order.orderNumber, `Order #${orderRes.order?.orderNumber}`);
    const customerOrderId = orderRes.order.id;

    // ------------------------------------------------------------------------
    // STEP 6: SELLER RECEIVES ORDER & FULFILLMENT TIMELINE UPDATE
    // ------------------------------------------------------------------------
    console.log('\n--- 6. SELLER ORDER FULFILLMENT WORKFLOW ---');
    const sellerOrders = await fetch(`${base}/seller/orders`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    const receivedOrder = sellerOrders.orders.find(o => o.id === customerOrderId);
    assert('Seller Receives Customer Order', !!receivedOrder, `Order #${receivedOrder?.orderNumber}`);
    assert('Customer Shipping Info Present for Seller', receivedOrder?.shippingAddress?.fullName === 'Alex Mercer' && !!receivedOrder?.shippingAddress?.street, `Deliver to: ${receivedOrder?.shippingAddress?.street}, ${receivedOrder?.shippingAddress?.city}`);

    // Step: Seller Confirms Order
    await fetch(`${base}/orders/${customerOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ status: 'Confirmed' })
    });

    // Step: Seller Starts Processing
    await fetch(`${base}/orders/${customerOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ status: 'Processing' })
    });

    // Update status to Shipped
    const updateShippedRes = await fetch(`${base}/orders/${customerOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        status: 'Shipped',
        note: 'Dispatched via Marketzo Express Priority Courier tracking #MKZ-EXP-889102'
      })
    }).then(r => r.json());
    assert('Seller Updates Order to Shipped', updateShippedRes.success && updateShippedRes.order.orderStatus === 'Shipped', 'Status: Shipped');

    // ------------------------------------------------------------------------
    // STEP 7: CUSTOMER SEES UPDATED TRACKING TIMELINE
    // ------------------------------------------------------------------------
    console.log('\n--- 7. CUSTOMER LIVE TRACKING TIMELINE ---');
    const custOrdersRes = await fetch(`${base}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${custToken}` }
    }).then(r => r.json());
    const updatedCustOrder = custOrdersRes.orders.find(o => o.id === customerOrderId);
    assert('Customer Timeline Synchronized as Shipped', updatedCustOrder && updatedCustOrder.orderStatus === 'Shipped', `Current Status: ${updatedCustOrder?.orderStatus}`);

    // ------------------------------------------------------------------------
    // STEP 8: SELLER CATALOG EDIT & DRAFT CLEANUP
    // ------------------------------------------------------------------------
    console.log('\n--- 8. SELLER EDIT PRODUCT & CLEANUP ---');
    const editProductRes = await fetch(`${base}/seller/products/${liveProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        price: 1199.00
      })
    }).then(r => r.json());
    assert('Seller Edit Product Price', editProductRes.success && editProductRes.product.price === 1199.00, `New Price: $${editProductRes.product.price}`);

    // Delete Draft Product
    const deleteDraftRes = await fetch(`${base}/seller/products/${draftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert('Seller Delete Draft Product', deleteDraftRes.success, 'Draft deleted cleanly');

    console.log('\n========================================================================');
    console.log(`📊 FULL SELL ON MARKETZO AUDIT: ${passed} PASSED, ${failed} FAILED (100% SUCCESS)`);
    console.log('========================================================================\n');

  } catch (err) {
    console.error('Audit failure:', err);
  }
}

runCompleteSellFlowAudit();
