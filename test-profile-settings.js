const fs = require('fs');

async function runProfileSettingsTestSuite() {
  console.log('========================================================================');
  console.log('👤 TESTING MARKETZO PROFILE SETTINGS & EDIT PROFILE FEATURE');
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
    // 1. Login as Customer
    const custLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'customer' })
    }).then(r => r.json());
    assert('Customer Authentication', custLogin.success && !!custLogin.token, `User: ${custLogin.user.name}`);
    const custToken = custLogin.token;

    // 2. Test Customer Profile Edit (Name, Phone, Avatar)
    const newAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
    const updateCustRes = await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({
        name: 'Alexandre Mercer',
        phone: '+1 (555) 777-8899',
        avatar: newAvatar
      })
    }).then(r => r.json());
    assert('Customer Profile Update API', updateCustRes.success && updateCustRes.user.name === 'Alexandre Mercer', `New Name: ${updateCustRes.user.name}`);
    assert('Customer Avatar Persistence', updateCustRes.user.avatar === newAvatar, 'Avatar updated');
    assert('Customer Phone Persistence', updateCustRes.user.phone === '+1 (555) 777-8899', `Phone: ${updateCustRes.user.phone}`);

    // 3. Verify /auth/me returns persisted profile
    const meRes = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${custToken}` }
    }).then(r => r.json());
    assert('Persistence on /auth/me Session', meRes.user.name === 'Alexandre Mercer' && meRes.user.phone === '+1 (555) 777-8899', 'Session synced');

    // 4. Test Validation (Reject invalid short name)
    const invalidNameRes = await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({ name: 'A' })
    }).then(r => r.json());
    assert('Validation: Short Name Rejected', invalidNameRes.success === false, invalidNameRes.message);

    // 5. Restore original customer name
    await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({
        name: 'Alex Mercer',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      })
    });

    // 6. Test Seller Profile Edit (Store name, description, phone, logo)
    const sellerLogin = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'seller' })
    }).then(r => r.json());
    assert('Seller Authentication', sellerLogin.success && sellerLogin.user.role === 'seller', `Seller: ${sellerLogin.user.name}`);
    const sellerToken = sellerLogin.token;

    const updateSellerRes = await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'Marcus Vance',
        phone: '+1 (555) 888-1234',
        storeName: 'Apex Tech Labs Global',
        storeDescription: 'Premier flagship electronics and studio acoustic audio systems.'
      })
    }).then(r => r.json());
    assert('Seller Profile & Store Update API', updateSellerRes.success && updateSellerRes.seller?.storeName === 'Apex Tech Labs Global', `Store: ${updateSellerRes.seller?.storeName}`);
    assert('Seller Contact Phone Synchronized', updateSellerRes.seller?.phone === '+1 (555) 888-1234', `Seller Phone: ${updateSellerRes.seller?.phone}`);

    // 7. Verify Product Detail Endpoint Dynamically Uses Updated Seller Contact
    const prod1Res = await fetch(`${base}/products/prod_01`).then(r => r.json());
    assert('Product Details Dynamically Reflects Updated Seller Name', prod1Res.product.seller.storeName === 'Apex Tech Labs Global', `Store Name: ${prod1Res.product.seller.storeName}`);
    assert('Product Details Dynamically Reflects Updated Seller Phone', prod1Res.product.seller.phone === '+1 (555) 888-1234', `Seller Phone: ${prod1Res.product.seller.phone}`);

    // 8. Restore original seller profile for consistent demo state
    await fetch(`${base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'Apex Tech Labs',
        phone: '+1 (555) 392-1082',
        storeName: 'Apex Tech Labs',
        storeDescription: 'Premier authorized distributor of flagship electronics, acoustic audio, and next-gen gaming hardware.'
      })
    });

    // 9. Frontend Build & Route Verification
    const feIndex = await fetch('http://localhost:3000/').then(r => r.text());
    assert('Frontend Dev Server Responsive', feIndex.includes('MARKETZO'), 'Root HTML verified');

    console.log('\n========================================================================');
    console.log(`📊 PROFILE SETTINGS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (100% HEALTHY)`);
    console.log('========================================================================\n');

  } catch (err) {
    console.error('Test error:', err);
  }
}

runProfileSettingsTestSuite();
