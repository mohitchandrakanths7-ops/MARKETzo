const http = require('http');

// Helper to send HTTP requests to test the server directly
async function runTests() {
  console.log('🧪 Starting Marketzo Feature on Home Page Workflow Automated Tests...');

  // Start the server programmatically for testing
  const db = require('./server/config/database');
  const app = require('./server/index');

  // Let's create an admin user and seller user for testing
  const adminUser = {
    id: 'usr_test_admin_feat',
    name: 'Platform Admin',
    email: 'admin_feat_test@marketzo.com',
    password: 'hashed_password',
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  const sellerUser = {
    id: 'usr_test_seller_feat',
    name: 'Apex Merchant',
    email: 'seller_feat_test@marketzo.com',
    password: 'hashed_password',
    role: 'seller',
    createdAt: new Date().toISOString()
  };

  const sellerProfile = {
    id: 'sel_test_feat',
    userId: sellerUser.id,
    storeName: 'Apex Audio Gear Store',
    slug: 'apex-audio-gear-store',
    status: 'approved',
    rating: 4.9,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  };

  const testProduct = {
    id: 'prod_test_feat_101',
    sellerId: sellerProfile.id,
    categoryId: 'cat_electronics',
    brandId: 'br_custom',
    name: 'Apex Studio Pro ANC Wireless Headphones',
    slug: 'apex-studio-pro-anc-wireless-headphones',
    description: 'High-definition wireless studio headphones with active noise cancellation.',
    price: 199.99,
    originalPrice: 249.99,
    discountPercent: 20,
    stock: 25,
    rating: 4.9,
    reviewCount: 18,
    status: 'approved', // Published
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    isFeatured: false,
    createdAt: new Date().toISOString()
  };

  const customerUser = {
    id: 'usr_cust_temp_feat',
    name: 'Customer Test',
    email: 'customer_feat@test.com',
    password: 'hashed_password',
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  // Insert into test DB
  db.insert('users', adminUser);
  db.insert('users', sellerUser);
  db.insert('users', customerUser);
  db.insert('sellers', sellerProfile);
  db.insert('products', testProduct);

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'marketzo-secret-jwt-key-2026-production';
  const sellerToken = jwt.sign({ id: sellerUser.id, email: sellerUser.email, role: 'seller' }, JWT_SECRET, { expiresIn: '1d' });
  const adminToken = jwt.sign({ id: adminUser.id, email: adminUser.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  const customerToken = jwt.sign({ id: customerUser.id, email: customerUser.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1d' });

  // Start temporary server
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
    // 1. Initial State: No featured products returned
    console.log('\n--- Test 1: Query public /products/featured before feature approval ---');
    const initFeat = await apiReq('/products/featured');
    console.log(`Initial featured count: ${initFeat.data.count}`);
    const existsInitially = (initFeat.data.products || []).some(p => p.id === testProduct.id);
    if (!existsInitially) {
      console.log('✅ Product is not initially on Home Page featured section.');
    } else {
      throw new Error('Product should not be featured before request and approval.');
    }

    // 2. Security Check: Customer cannot request feature
    console.log('\n--- Test 2: Security check - Customer cannot request feature ---');
    const custReq = await apiReq('/seller/feature-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: testProduct.id, homePageSection: 'Featured Products', priority: 5 })
    });
    if (custReq.status === 403) {
      console.log('✅ Non-seller blocked from requesting feature (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 but got ${custReq.status}`);
    }

    // 3. Seller Flow: Seller requests feature for published product
    console.log('\n--- Test 3: Seller submits feature request ---');
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sellerReq = await apiReq('/seller/feature-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({
        productId: testProduct.id,
        homePageSection: 'Featured Products',
        priority: 5,
        featuredUntil: expiryDate
      })
    });
    console.log('Seller request response:', sellerReq.data);
    if (sellerReq.status === 201 && sellerReq.data.success && sellerReq.data.request.status === 'pending') {
      console.log('✅ Feature request created with status "pending".');
    } else {
      throw new Error('Failed to create pending feature request.');
    }

    const requestId = sellerReq.data.request.id;

    // 4. Seller Flow: Seller retrieves feature requests
    console.log('\n--- Test 4: Seller views their feature requests ---');
    const sellerList = await apiReq('/seller/feature-requests', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const foundInSellerList = sellerList.data.requests?.find(r => r.id === requestId);
    if (foundInSellerList && foundInSellerList.status === 'pending') {
      console.log('✅ Seller sees their pending request.');
    } else {
      throw new Error('Seller requests list did not contain pending request.');
    }

    // 5. Admin Flow: Admin retrieves feature requests
    console.log('\n--- Test 5: Admin retrieves feature requests ---');
    const adminList = await apiReq('/admin/feature-requests', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundInAdminList = adminList.data.requests?.find(r => r.id === requestId);
    if (foundInAdminList && foundInAdminList.sellerStoreName === sellerProfile.storeName && foundInAdminList.productName === testProduct.name) {
      console.log('✅ Admin sees pending request with store name and product details populated.');
    } else {
      throw new Error('Admin could not see populated request.');
    }

    // 6. Security Check: Seller cannot approve request
    console.log('\n--- Test 6: Security check - Seller cannot approve own request ---');
    const sellerApproveAttempt = await apiReq(`/admin/feature-requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ status: 'approved' })
    });
    if (sellerApproveAttempt.status === 403) {
      console.log('✅ Seller blocked from admin moderation endpoint (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 for seller trying to approve but got ${sellerApproveAttempt.status}`);
    }

    // 7. Admin Flow: Admin approves request
    console.log('\n--- Test 7: Admin approves feature request ---');
    const adminApprove = await apiReq(`/admin/feature-requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'approved',
        priority: 10,
        homePageSection: 'Featured Products',
        featuredUntil: expiryDate
      })
    });
    if (adminApprove.status === 200 && adminApprove.data.success) {
      console.log('✅ Admin approved feature request successfully.');
    } else {
      throw new Error('Admin approval failed.');
    }

    // 8. Home Page Flow: Product now dynamically appears on Home Page /products/featured
    console.log('\n--- Test 8: Verify product dynamically returned on /products/featured ---');
    const featRes = await apiReq('/products/featured');
    const featProd = (featRes.data.products || []).find(p => p.id === testProduct.id);
    if (featProd && featProd.name === testProduct.name && featProd.sellerName === sellerProfile.storeName) {
      console.log('✅ Approved product successfully returned dynamically in Home Page Featured Products API!');
      console.log(`   Product Name: ${featProd.name}`);
      console.log(`   Seller Name: ${featProd.sellerName}`);
      console.log(`   Price: ${featProd.price}`);
      console.log(`   Section: ${featProd.featureSection}`);
    } else {
      throw new Error('Approved product not found in /products/featured.');
    }

    // 9. Seller Flow: Seller sees "approved" status
    console.log('\n--- Test 9: Seller sees "approved" status ---');
    const sellerApprovedCheck = await apiReq('/seller/feature-requests', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const updatedSellerReq = sellerApprovedCheck.data.requests?.find(r => r.id === requestId);
    if (updatedSellerReq && updatedSellerReq.status === 'approved') {
      console.log('✅ Seller gets status: "approved" (will render "✅ Featured on Home Page").');
    } else {
      throw new Error('Seller request status is not approved.');
    }

    // 10. Admin Flow: Admin removes product from Home Page
    console.log('\n--- Test 10: Admin removes product from Home Page ---');
    const adminRemove = await apiReq(`/admin/feature-requests/${requestId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminRemove.status === 200 && adminRemove.data.success) {
      console.log('✅ Admin removed product from Home Page.');
    } else {
      throw new Error('Failed to remove product from Home Page.');
    }

    // 11. Home Page Flow: Product disappears from Featured section
    console.log('\n--- Test 11: Verify product no longer appears in Featured section ---');
    const featAfterRemoval = await apiReq('/products/featured');
    const featAfterProd = (featAfterRemoval.data.products || []).find(p => p.id === testProduct.id);
    if (!featAfterProd) {
      console.log('✅ Product is no longer in Featured Products section.');
    } else {
      throw new Error('Product still in featured section after removal.');
    }

    // 12. Rejection & Resubmission Flow:
    console.log('\n--- Test 12: Admin rejects request -> Seller resubmits ---');
    // Resubmit
    const resubReq = await apiReq('/seller/feature-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ productId: testProduct.id, homePageSection: 'Hot Deals', priority: 3 })
    });
    const newReqId = resubReq.data.request.id;
    // Reject it
    await apiReq(`/admin/feature-requests/${newReqId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'rejected', rejectionReason: 'Category quota full.' })
    });
    // Check seller sees rejected
    const checkRej = await apiReq('/seller/feature-requests', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    const rejReq = checkRej.data.requests?.find(r => r.id === newReqId);
    if (rejReq && rejReq.status === 'rejected') {
      console.log('✅ Seller sees status: "rejected" (will render "❌ Feature Request Rejected" allowing resubmission).');
    } else {
      throw new Error('Expected rejected status for seller.');
    }

    // Resubmit after rejection
    const reResub = await apiReq('/seller/feature-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({ productId: testProduct.id, homePageSection: 'Recommended', priority: 7 })
    });
    if (reResub.data.request.status === 'pending') {
      console.log('✅ Seller successfully resubmitted feature request (status becomes "pending" again).');
    } else {
      throw new Error('Resubmission after rejection failed.');
    }

    console.log('\n🎉 ALL 12 AUTOMATED TESTS PASSED SUCCESSFULLY! 🚀');
  } finally {
    // Cleanup test data from db
    db.delete('users', adminUser.id);
    db.delete('users', sellerUser.id);
    db.delete('users', customerUser.id);
    db.delete('sellers', sellerProfile.id);
    db.delete('products', testProduct.id);
    db.delete('featureRequests', r => r.productId === testProduct.id);
    server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
