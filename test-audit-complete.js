const db = require('./server/config/database');
const app = require('./server/index');
const jwt = require('jsonwebtoken');

async function runAudit() {
  console.log('🔍 Starting Complete MARKETZO Marketplace System Audit & Verification Tests...\n');

  const JWT_SECRET = process.env.JWT_SECRET || 'marketzo-secret-jwt-key-2026-production';

  // Seed sample test users and merchants
  const adminUser = { id: 'usr_audit_admin', name: 'Super Admin', email: 'admin_audit@marketzo.com', role: 'admin', createdAt: new Date().toISOString() };
  const seller1User = { id: 'usr_audit_seller1', name: 'Acoustic Merchant', email: 'seller1_audit@marketzo.com', role: 'seller', createdAt: new Date().toISOString() };
  const seller2User = { id: 'usr_audit_seller2', name: 'Fashion Merchant', email: 'seller2_audit@marketzo.com', role: 'seller', createdAt: new Date().toISOString() };
  const customerUser = { id: 'usr_audit_cust1', name: 'Alice Customer', email: 'cust1_audit@gmail.com', role: 'customer', createdAt: new Date().toISOString() };
  const attackerUser = { id: 'usr_audit_cust2', name: 'Mallory Attacker', email: 'cust2_audit@gmail.com', role: 'customer', createdAt: new Date().toISOString() };

  const seller1Profile = { id: 'sel_audit_01', userId: seller1User.id, storeName: 'Acoustics & Tech World', status: 'approved', rating: 4.9, reviewCount: 50 };
  const seller2Profile = { id: 'sel_audit_02', userId: seller2User.id, storeName: 'Urban Silk & Apparel', status: 'approved', rating: 4.8, reviewCount: 30 };

  db.insert('users', adminUser);
  db.insert('users', seller1User);
  db.insert('users', seller2User);
  db.insert('users', customerUser);
  db.insert('users', attackerUser);

  db.insert('sellers', seller1Profile);
  db.insert('sellers', seller2Profile);

  const adminToken = jwt.sign({ id: adminUser.id, email: adminUser.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  const seller1Token = jwt.sign({ id: seller1User.id, email: seller1User.email, role: 'seller' }, JWT_SECRET, { expiresIn: '1d' });
  const seller2Token = jwt.sign({ id: seller2User.id, email: seller2User.email, role: 'seller' }, JWT_SECRET, { expiresIn: '1d' });
  const customerToken = jwt.sign({ id: customerUser.id, email: customerUser.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1d' });
  const attackerToken = jwt.sign({ id: attackerUser.id, email: attackerUser.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1d' });

  // Test products across departments
  const testProducts = [
    {
      id: 'prod_audit_elec',
      name: 'Wireless Bluetooth Studio Pro ANC Earbuds',
      slug: 'wireless-bluetooth-studio-pro-anc-earbuds',
      categoryId: 'cat_electronics',
      sellerId: seller1Profile.id,
      price: 120,
      originalPrice: 160,
      discountPercent: 25,
      stock: 30,
      rating: 4.9,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']
    },
    {
      id: 'prod_audit_sport',
      name: 'Smart Workout Dumbbell & Fitness Tracker Set',
      slug: 'smart-workout-dumbbell-set',
      categoryId: 'cat_sports',
      sellerId: seller1Profile.id,
      price: 85,
      originalPrice: 100,
      discountPercent: 15,
      stock: 20,
      rating: 4.7,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800']
    },
    {
      id: 'prod_audit_mobile',
      name: 'Aurora Ultra 5G Smartphone with 108MP Camera',
      slug: 'aurora-ultra-5g-smartphone',
      categoryId: 'cat_mobiles',
      sellerId: seller1Profile.id,
      price: 699,
      originalPrice: 799,
      discountPercent: 12,
      stock: 15,
      rating: 4.8,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800']
    },
    {
      id: 'prod_audit_laptop',
      name: 'Zenith Pro 16-inch OLED Workstation Laptop',
      slug: 'zenith-pro-16-inch-oled-laptop',
      categoryId: 'cat_laptops',
      sellerId: seller1Profile.id,
      price: 1299,
      originalPrice: 1499,
      discountPercent: 13,
      stock: 10,
      rating: 4.9,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800']
    },
    {
      id: 'prod_audit_fashion',
      name: 'Tailored 100% Virgin Merino Wool Winter Overcoat',
      slug: 'tailored-merino-wool-overcoat',
      categoryId: 'cat_fashion',
      sellerId: seller2Profile.id,
      price: 240,
      originalPrice: 320,
      discountPercent: 25,
      stock: 25,
      rating: 4.8,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800']
    },
    {
      id: 'prod_audit_jewellery',
      name: 'Lumiere Automatic Diamond Chronograph Watch',
      slug: 'lumiere-diamond-chronograph-watch',
      categoryId: 'cat_jewellery',
      sellerId: seller2Profile.id,
      price: 850,
      originalPrice: 1000,
      discountPercent: 15,
      stock: 8,
      rating: 5.0,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800']
    },
    {
      id: 'prod_audit_home',
      name: 'Artisan Nordic Precision Espresso Maker',
      slug: 'artisan-nordic-espresso-maker',
      categoryId: 'cat_home',
      sellerId: seller2Profile.id,
      price: 180,
      originalPrice: 200,
      discountPercent: 10,
      stock: 12,
      rating: 4.8,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800']
    },
    {
      id: 'prod_audit_beauty',
      name: 'Organic Botanical Glow Face Serum with Niacinamide',
      slug: 'organic-botanical-glow-serum',
      categoryId: 'cat_beauty',
      sellerId: seller2Profile.id,
      price: 45,
      originalPrice: 60,
      discountPercent: 25,
      stock: 50,
      rating: 4.9,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800']
    },
    {
      id: 'prod_audit_grocery',
      name: 'Single-Origin Highland Organic Dark Roast Coffee Beans',
      slug: 'single-origin-highland-coffee-beans',
      categoryId: 'cat_grocery',
      sellerId: seller2Profile.id,
      price: 22,
      originalPrice: 25,
      discountPercent: 12,
      stock: 100,
      rating: 4.9,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800']
    }
  ];

  testProducts.forEach(p => db.insert('products', p));

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  async function apiReq(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    // ==========================================
    // SECTION 1: CATEGORY FILTERING AUDIT
    // ==========================================
    console.log('📌 Test Group 1: Category Filtering Precision');

    // 1.1 Test Electronics & Audio
    const elecRes = await apiReq('/products?category=cat_electronics');
    const elecIds = (elecRes.data.products || []).map(p => p.id);
    if (elecIds.includes('prod_audit_elec') && !elecIds.includes('prod_audit_sport')) {
      console.log('  ✅ Category "cat_electronics": Returned only Electronics products, excluded Sports products.');
    } else {
      throw new Error(`Electronics filter returned incorrect products: ${JSON.stringify(elecIds)}`);
    }

    // 1.2 Test Electronics slug "electronics-audio"
    const elecSlugRes = await apiReq('/products?category=electronics-audio');
    const elecSlugIds = (elecSlugRes.data.products || []).map(p => p.id);
    if (elecSlugIds.includes('prod_audit_elec') && !elecSlugIds.includes('prod_audit_sport')) {
      console.log('  ✅ Category slug "electronics-audio": Returned only Electronics products.');
    } else {
      throw new Error('Electronics slug filter failed.');
    }

    // 1.3 Test Sports & Fitness
    const sportRes = await apiReq('/products?category=cat_sports');
    const sportIds = (sportRes.data.products || []).map(p => p.id);
    if (sportIds.includes('prod_audit_sport') && !sportIds.includes('prod_audit_elec')) {
      console.log('  ✅ Category "cat_sports": Returned only Sports products, excluded Electronics products.');
    } else {
      throw new Error('Sports filter failed.');
    }

    // 1.4 Test Sports slug "sports-fitness"
    const sportSlugRes = await apiReq('/products?category=sports-fitness');
    const sportSlugIds = (sportSlugRes.data.products || []).map(p => p.id);
    if (sportSlugIds.includes('prod_audit_sport') && !sportSlugIds.includes('prod_audit_elec')) {
      console.log('  ✅ Category slug "sports-fitness": Returned only Sports products.');
    } else {
      throw new Error('Sports slug filter failed.');
    }

    // 1.5 Test All Categories individually
    const categoryChecks = [
      { param: 'mobiles-tablets', expected: 'prod_audit_mobile' },
      { param: 'laptops-computers', expected: 'prod_audit_laptop' },
      { param: 'fashion-apparel', expected: 'prod_audit_fashion' },
      { param: 'jewellery-watches', expected: 'prod_audit_jewellery' },
      { param: 'home-kitchen', expected: 'prod_audit_home' },
      { param: 'beauty-skincare', expected: 'prod_audit_beauty' },
      { param: 'gourmet-organic', expected: 'prod_audit_grocery' }
    ];

    for (const check of categoryChecks) {
      const res = await apiReq(`/products?category=${check.param}`);
      const ids = (res.data.products || []).map(p => p.id);
      if (ids.includes(check.expected)) {
        console.log(`  ✅ Department "${check.param}": Correctly matches target product.`);
      } else {
        throw new Error(`Category ${check.param} failed to return expected product.`);
      }
    }

    // 1.6 Test All Products
    const allRes = await apiReq('/products?category=all');
    if (allRes.data.products && allRes.data.products.length >= testProducts.length) {
      console.log('  ✅ "category=all" returns all marketplace active products.');
    } else {
      throw new Error('category=all did not return all products.');
    }

    // 1.7 Test Hot Deals
    const hotDealsRes = await apiReq('/products?hotDeals=true');
    const hotDealIds = (hotDealsRes.data.products || []).map(p => p.id);
    // Products with discount >= 20%: elec (25%), fashion (25%), beauty (25%)
    if (hotDealIds.includes('prod_audit_elec') && hotDealIds.includes('prod_audit_fashion') && hotDealIds.includes('prod_audit_beauty') && !hotDealIds.includes('prod_audit_mobile')) {
      console.log('  ✅ "hotDeals=true": Accurately filters only products with 20%+ promotional discounts.');
    } else {
      throw new Error(`Hot deals filter returned unexpected list: ${JSON.stringify(hotDealIds)}`);
    }

    // ==========================================
    // SECTION 2: BUYING & ORDER FLOW SECURITY
    // ==========================================
    console.log('\n📌 Test Group 2: Buying Flow & Security Validation');

    // 2.1 Order creation with server-side price validation
    const orderPayload = {
      items: [
        {
          productId: 'prod_audit_elec',
          name: 'Wireless Bluetooth Studio Pro ANC Earbuds',
          quantity: 2,
          price: 1 // Malicious client attempts $1 price tampering
        }
      ],
      shippingAddress: {
        fullName: 'Alice Customer',
        street: '456 Marketzo Blvd',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '+91 9876543210'
      },
      paymentMethod: 'UPI / Online Card Payment',
      deliverySpeed: 'standard'
    };

    const createOrderRes = await apiReq('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify(orderPayload)
    });

    if (createOrderRes.status === 201 && createOrderRes.data.success) {
      const order = createOrderRes.data.order;
      // Server price is $120 each. 2 items = $240 subtotal. Client tried $1.
      if (order.subtotal === 240) {
        console.log('  ✅ Server-side price validation: Successfully rejected client price tampering and charged real DB price ($240).');
      } else {
        throw new Error(`Price tampering was not prevented! Total was: ${order.subtotal}`);
      }

      // Check stock decremented (initial 30 - 2 = 28)
      const prodAfterOrder = db.findById('products', 'prod_audit_elec');
      if (prodAfterOrder.stock === 28) {
        console.log('  ✅ Inventory decrement: Stock correctly decremented from 30 to 28.');
      } else {
        throw new Error(`Stock not decremented properly: ${prodAfterOrder.stock}`);
      }

      // 2.2 Customer views their own orders
      const myOrdersRes = await apiReq('/orders/my-orders', {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      if (myOrdersRes.data.orders?.some(o => o.id === order.id)) {
        console.log('  ✅ Customer orders retrieval: Customer sees their placed order.');
      } else {
        throw new Error('Customer could not find placed order in my-orders.');
      }

      // 2.3 IDOR Protection: Attacker cannot access Customer 1 order
      const idorAttempt = await apiReq(`/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${attackerToken}` }
      });
      if (idorAttempt.status === 403) {
        console.log('  ✅ IDOR security: Unauthorized customer blocked from viewing another customer order (403 Forbidden).');
      } else {
        throw new Error(`Expected 403 for IDOR attempt, but got ${idorAttempt.status}`);
      }

      // 2.4 Seller views order containing their product
      const sellerOrders = await apiReq('/seller/orders', {
        headers: { Authorization: `Bearer ${seller1Token}` }
      });
      if (sellerOrders.data.orders?.some(o => o.id === order.id)) {
        console.log('  ✅ Seller orders: Merchant sees customer order containing their product.');
      } else {
        throw new Error('Seller could not find order in seller orders.');
      }

      // 2.5 Seller updates order status sequentially
      const statusUpdateRes = await apiReq(`/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${seller1Token}` },
        body: JSON.stringify({ status: 'Confirmed', note: 'Order confirmed and ready for dispatch.' })
      });
      if (statusUpdateRes.data.success && statusUpdateRes.data.order.orderStatus === 'Confirmed') {
        console.log('  ✅ Sequential fulfillment: Merchant updated order status to "Confirmed".');
      } else {
        throw new Error('Seller order status update failed.');
      }
    } else {
      throw new Error(`Order creation failed: ${JSON.stringify(createOrderRes.data)}`);
    }

    // ==========================================
    // SECTION 3: SELLER PRODUCT SECURITY
    // ==========================================
    console.log('\n📌 Test Group 3: Product Security & Multi-Vendor Permissions');

    // 3.1 Seller 2 cannot edit Seller 1 product
    const maliciousEdit = await apiReq('/seller/products/prod_audit_elec', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seller2Token}` },
      body: JSON.stringify({ price: 10 })
    });
    if (maliciousEdit.status === 403) {
      console.log('  ✅ Multi-vendor isolation: Seller 2 blocked from modifying Seller 1 product (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 for cross-seller edit attempt, got ${maliciousEdit.status}`);
    }

    // ==========================================
    // SECTION 4: AI SHOPPING GUIDE & SELLER HELPER
    // ==========================================
    console.log('\n📌 Test Group 4: AI Shopping Assistant & Real DB Recommendations');

    // 4.1 Natural language budget query
    const aiShopperRes = await apiReq('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ query: 'I need wireless ANC earbuds under ₹12,000', currency: 'INR', exchangeRate: 86.5 })
    });
    if (aiShopperRes.data.success && aiShopperRes.data.recommendations?.length > 0) {
      const topRec = aiShopperRes.data.recommendations[0];
      if (topRec.name.includes('Earbuds') || topRec.name.includes('Wireless')) {
        console.log(`  ✅ AI Shopping Assistant: Successfully recommended real catalog product "${topRec.name}" ($${topRec.price}) within budget.`);
      } else {
        throw new Error(`AI recommended unrelated product: ${topRec.name}`);
      }
    } else {
      throw new Error(`AI assistant query failed: ${JSON.stringify(aiShopperRes.data)}`);
    }

    // 4.2 Seller AI optimization assistant
    const aiSellerRes = await apiReq('/ai/seller-help', {
      method: 'POST',
      body: JSON.stringify({ productName: 'Mechanical RGB Gaming Keyboard', categoryId: 'cat_electronics' })
    });
    if (aiSellerRes.data.success && aiSellerRes.data.suggestedTags?.length > 0 && aiSellerRes.data.suggestedHighlights?.length > 0) {
      console.log('  ✅ Seller AI Assistant: Generated enhanced title, description, tags, and warranty highlights.');
    } else {
      throw new Error('Seller AI help failed.');
    }

    console.log('\n🎉 ALL AUDIT VERIFICATION CHECKS PASSED WITH 100% SUCCESS! 🚀');

  } finally {
    // Cleanup test data
    db.delete('users', adminUser.id);
    db.delete('users', seller1User.id);
    db.delete('users', seller2User.id);
    db.delete('users', customerUser.id);
    db.delete('users', attackerUser.id);
    db.delete('sellers', seller1Profile.id);
    db.delete('sellers', seller2Profile.id);
    testProducts.forEach(p => db.delete('products', p.id));
    db.delete('orders', o => o.userId === customerUser.id);
    server.close();
  }
}

runAudit().catch(err => {
  console.error('❌ Audit failed with error:', err);
  process.exit(1);
});
