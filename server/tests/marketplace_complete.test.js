/**
 * Comprehensive Automated Marketplace Test Suite (Native Fetch)
 * Tests all 15 Core Marketplace Features End-to-End
 */

const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    console.error(`\n   [HTTP ${res.status}] ${options.method || 'GET'} ${path}:`, data);
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('🚀 Starting MARKETZO Marketplace Complete Feature Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Auth Logins
  let customerToken, sellerToken, adminToken;
  let customerUser, sellerUser;

  await test('1. Authentication for Customer, Seller, and Admin', async () => {
    // Customer login
    const custRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'alex@marketzo.com', password: 'password123' }
    });
    assert.strictEqual(custRes.data.success, true);
    customerToken = custRes.data.token;
    customerUser = custRes.data.user;

    // Seller login
    const selRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'techstore@marketzo.com', password: 'password123' }
    });
    assert.strictEqual(selRes.data.success, true);
    sellerToken = selRes.data.token;
    sellerUser = selRes.data.user;

    // Admin login
    const admRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@marketzo.com', password: 'password123' }
    });
    assert.strictEqual(admRes.data.success, true);
    adminToken = admRes.data.token;
  });

  const custHeaders = () => ({ headers: { Authorization: `Bearer ${customerToken}` } });
  const selHeaders = () => ({ headers: { Authorization: `Bearer ${sellerToken}` } });
  const admHeaders = () => ({ headers: { Authorization: `Bearer ${adminToken}` } });

  // 2. Chat System
  let activeConversationId;
  await test('2. Seller In-App Live Chat System', async () => {
    // Customer initiates chat
    const initRes = await req('/chat/conversations', {
      method: 'POST',
      body: {
        sellerId: 'sel_01',
        productId: 'prod_01',
        initialMessage: 'Hello, is this ANC headphone currently in stock for fast dispatch?'
      },
      ...custHeaders()
    });
    assert.strictEqual(initRes.data.success, true);
    activeConversationId = initRes.data.conversation.id;

    // Seller replies
    const replyRes = await req(`/chat/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      body: { content: 'Yes! We dispatch within 2 hours with express tracking.' },
      ...selHeaders()
    });
    assert.strictEqual(replyRes.data.success, true);

    // Fetch conversation thread
    const threadRes = await req(`/chat/conversations/${activeConversationId}`, custHeaders());
    assert.strictEqual(threadRes.data.success, true);
    assert.strictEqual(threadRes.data.messages.length >= 2, true);
  });

  // 3. AI Shopping Assistant
  await test('3. AI Shopping Assistant grounded catalog recommendation', async () => {
    const aiRes = await req('/ai/recommend', {
      method: 'POST',
      body: { prompt: 'I want premium noise cancelling headphones under $300' }
    });
    assert.strictEqual(aiRes.data.success, true);
    assert.strictEqual(typeof aiRes.data.reply, 'string');
    assert.strictEqual(Array.isArray(aiRes.data.recommendations), true);
  });

  // 4. Visual Search
  await test('4. Visual Product Search image similarity matcher', async () => {
    const visRes = await req('/visualsearch/analyze', {
      method: 'POST',
      body: { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }
    });
    assert.strictEqual(visRes.data.success, true);
    assert.strictEqual(Array.isArray(visRes.data.results), true);
    assert.strictEqual(visRes.data.results.length > 0, true);
  });

  // 5. Flash Sales
  let createdFlashId;
  await test('5. Flash Sales creation and active ticker listing', async () => {
    const createRes = await req('/flashsales', {
      method: 'POST',
      body: {
        productId: 'prod_01',
        salePrice: 199.99,
        durationHours: 12,
        saleStock: 15
      },
      ...selHeaders()
    });
    assert.strictEqual(createRes.data.success, true);
    createdFlashId = createRes.data.flashSale.id;

    const activeRes = await req('/flashsales/active');
    assert.strictEqual(activeRes.data.success, true);
    assert.strictEqual(activeRes.data.flashSales.length > 0, true);
  });

  // 6. Follow Store
  await test('6. Follow / Unfollow Merchant Store & Follower Count', async () => {
    const sellerId = 'sel_01';
    const folRes = await req('/follows/toggle', {
      method: 'POST',
      body: { sellerId },
      ...custHeaders()
    });
    assert.strictEqual(folRes.data.success, true);
    assert.strictEqual(typeof folRes.data.isFollowing, 'boolean');

    const listRes = await req('/follows/following', custHeaders());
    assert.strictEqual(listRes.data.success, true);
    assert.strictEqual(Array.isArray(listRes.data.followedStores), true);
  });

  // 7. Wholesale RFQ & Tier Pricing
  let createdRfqId;
  await test('7. Wholesale Bulk Tier Pricing & RFQ Quotes', async () => {
    // Get tier pricing
    const tierRes = await req('/wholesale/product/prod_01');
    assert.strictEqual(tierRes.data.success, true);
    assert.strictEqual(Array.isArray(tierRes.data.tierPricing), true);

    // Submit RFQ
    const rfqRes = await req('/wholesale/rfq', {
      method: 'POST',
      body: {
        productId: 'prod_01',
        targetQuantity: 100,
        targetPricePerUnit: 180,
        shippingDestination: 'Chicago Logistics Hub',
        customSpecifications: 'Custom logo engraved on outer earcups'
      },
      ...custHeaders()
    });
    assert.strictEqual(rfqRes.data.success, true);
    createdRfqId = rfqRes.data.rfq.id;

    // Seller quotes RFQ
    const quoteRes = await req(`/wholesale/seller/rfq/${createdRfqId}/quote`, {
      method: 'POST',
      body: {
        offeredPricePerUnit: 185,
        minQuantity: 80,
        shippingCost: 50,
        estimatedProductionDays: 5,
        notes: 'Custom batch production ready in 5 business days.'
      },
      ...selHeaders()
    });
    assert.strictEqual(quoteRes.data.success, true);
    assert.strictEqual(quoteRes.data.rfq.status, 'quoted');
  });

  // 8. Seller Coupons
  let createdCouponCode = `TEST${Math.floor(Math.random() * 9000 + 1000)}`;
  await test('8. Seller Scoped Coupon Creation and Cart Validation', async () => {
    const cpnRes = await req('/coupons/seller', {
      method: 'POST',
      body: {
        code: createdCouponCode,
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 50,
        maxDiscountAmount: 30,
        description: '15% off test coupon'
      },
      ...selHeaders()
    });
    assert.strictEqual(cpnRes.data.success, true);

    // Validate coupon
    const valRes = await req('/coupons/validate', {
      method: 'POST',
      body: {
        code: createdCouponCode,
        cartTotal: 100,
        sellerId: 'sel_01'
      },
      ...custHeaders()
    });
    assert.strictEqual(valRes.data.success, true);
    assert.strictEqual(valRes.data.discountAmount, 15);
  });

  // 9. Order Creation, Multi-Step Fulfillment, Live Courier Tracking
  let testOrderId;
  await test('9. Order Creation with COD, Seller Progression & Live Tracking', async () => {
    // 1. Customer places COD order
    const orderRes = await req('/orders', {
      method: 'POST',
      body: {
        items: [{
          productId: 'prod_01',
          name: 'SonicPulse Pro Wireless Headphones',
          price: 249.99,
          quantity: 1,
          sellerId: 'sel_01'
        }],
        shippingAddress: {
          fullName: 'Alex Mercer',
          phone: '+1 555-0192',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          pincode: '62704'
        },
        paymentMethod: 'Cash on Delivery',
        deliverySpeed: 'Priority Express'
      },
      ...custHeaders()
    });

    assert.strictEqual(orderRes.data.success, true);
    testOrderId = orderRes.data.order.id;
    assert.strictEqual(orderRes.data.order.orderStatus, 'Pending');
    assert.strictEqual(orderRes.data.order.paymentStatus, 'pending');

    // 2. Seller Confirms Order
    const confRes = await req(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: { status: 'Confirmed' },
      ...selHeaders()
    });
    assert.strictEqual(confRes.data.success, true);
    assert.strictEqual(confRes.data.order.orderStatus, 'Confirmed');

    // 3. Seller Processing
    await req(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: { status: 'Processing' },
      ...selHeaders()
    });

    // 4. Seller Shipped
    const shipRes = await req(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: { status: 'Shipped' },
      ...selHeaders()
    });
    assert.strictEqual(shipRes.data.order.orderStatus, 'Shipped');
    assert.strictEqual(typeof shipRes.data.order.trackingNumber, 'string');

    // 5. Check Live Tracking endpoint
    const trackRes = await req(`/orders/${testOrderId}/track`, custHeaders());
    assert.strictEqual(trackRes.data.success, true);
    assert.strictEqual(trackRes.data.tracking.status, 'Shipped');
    assert.strictEqual(trackRes.data.tracking.timeline.length >= 4, true);

    // 6. Out for Delivery & Delivered
    await req(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: { status: 'Out for Delivery' },
      ...selHeaders()
    });
    const delivRes = await req(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: { status: 'Delivered' },
      ...selHeaders()
    });
    assert.strictEqual(delivRes.data.order.orderStatus, 'Delivered');
    // COD automatically marked paid upon delivery
    assert.strictEqual(delivRes.data.order.paymentStatus, 'paid');
  });

  // 10. Buyer Protection Disputes & Arbitration
  let createdDisputeId;
  await test('10. Buyer Protection Claim Submission, Seller Reply, and Admin Arbitration', async () => {
    // 1. Customer files dispute
    const claimRes = await req('/disputes', {
      method: 'POST',
      body: {
        orderId: testOrderId,
        reason: 'damaged_item',
        description: 'Minor cosmetic mark on right headphone cup during transit.'
      },
      ...custHeaders()
    });
    assert.strictEqual(claimRes.data.success, true);
    createdDisputeId = claimRes.data.dispute.id;

    // 2. Seller responds
    const selRespRes = await req(`/disputes/${createdDisputeId}/respond`, {
      method: 'POST',
      body: {
        sellerResponse: 'We have dispatched an accessory pouch and apologize for the shipping box scratch.'
      },
      ...selHeaders()
    });
    assert.strictEqual(selRespRes.data.success, true);
    assert.strictEqual(selRespRes.data.dispute.status, 'seller_replied');

    // 3. Admin arbitrates full refund resolution
    const arbRes = await req(`/disputes/admin/${createdDisputeId}/resolve`, {
      method: 'POST',
      body: {
        resolution: 'resolved_refund',
        refundAmount: 50,
        notes: 'Partial reimbursement credited to customer under 100% Buyer Protection.'
      },
      ...admHeaders()
    });
    assert.strictEqual(arbRes.data.success, true);
    assert.strictEqual(arbRes.data.dispute.status, 'resolved_refund');
  });

  // 11. Seller Wallet & Admin Payout
  let createdPayoutId;
  await test('11. Seller Wallet Balance, Withdrawal Request, and Admin Settlement', async () => {
    const sumRes = await req('/wallet/summary', selHeaders());
    assert.strictEqual(sumRes.data.success, true);
    assert.strictEqual(typeof sumRes.data.wallet.balance, 'number');

    // Request payout
    const reqRes = await req('/wallet/request-payout', {
      method: 'POST',
      body: {
        amount: 100,
        accountDetails: 'Chase Business Account *4920'
      },
      ...selHeaders()
    });
    assert.strictEqual(reqRes.data.success, true);
    createdPayoutId = reqRes.data.payoutRequest.id;

    // Admin approves payout
    const procRes = await req(`/wallet/admin/payouts/${createdPayoutId}/process`, {
      method: 'POST',
      body: {
        status: 'completed',
        referenceNumber: 'WIRE-MKZ-984102',
        notes: 'ACH transfer completed'
      },
      ...admHeaders()
    });
    assert.strictEqual(procRes.data.success, true);
    assert.strictEqual(procRes.data.payoutRequest.status, 'completed');
  });

  // 12. Verification & Badges
  let createdVerifId;
  await test('12. Seller Document Submission & Admin Badge Assignment', async () => {
    const subRes = await req('/verification/submit', {
      method: 'POST',
      body: {
        businessType: 'Private Corporation',
        registrationNumber: 'GSTIN-27AABCU9603R1ZM',
        taxId: 'US-EIN-94-2819402'
      },
      ...selHeaders()
    });
    assert.strictEqual(subRes.data.success, true);
    createdVerifId = subRes.data.verification.id;

    // Admin reviews and awards badges
    const revRes = await req('/verification/admin/review', {
      method: 'POST',
      body: {
        verificationId: createdVerifId,
        status: 'approved',
        assignedBadges: ['Verified Seller', 'Gold Supplier', 'Fast Shipping'],
        adminFeedback: 'All verified documents match tax registry.'
      },
      ...admHeaders()
    });
    assert.strictEqual(revRes.data.success, true);
    assert.strictEqual(revRes.data.verification.status, 'approved');
  });

  // 13. Verified Reviews & Seller Replies
  await test('13. Verified Buyer Reviews with Photo Proof and Merchant Replies', async () => {
    const revRes = await req('/products/prod_01/reviews', {
      method: 'POST',
      body: {
        rating: 5,
        title: 'Remarkable sound performance and crisp highs',
        comment: 'Top quality headphones, battery life exceeded my expectations.',
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400']
      },
      ...custHeaders()
    });
    assert.strictEqual(revRes.data.success, true);
    assert.strictEqual(revRes.data.review.verifiedPurchase, true);
    const reviewId = revRes.data.review.id;

    // Seller replies
    const replyRes = await req(`/products/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: {
        sellerReply: 'Thank you for your generous feedback! Enjoy the studio acoustic fidelity.'
      },
      ...selHeaders()
    });
    assert.strictEqual(replyRes.data.success, true);
    assert.strictEqual(typeof replyRes.data.review.sellerReply, 'string');
  });

  // 14. Currency System
  await test('14. Multi-Currency Exchange Rates API', async () => {
    const curRes = await req('/currency/rates');
    assert.strictEqual(curRes.data.success, true);
    assert.strictEqual(typeof curRes.data.rates.INR, 'number');
    assert.strictEqual(typeof curRes.data.rates.EUR, 'number');
  });

  console.log(`\n========================================`);
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
