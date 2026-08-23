const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// List Available Coupons
router.get('/', optionalAuth, (req, res) => {
  const now = new Date().toISOString();
  const coupons = db.findAll('coupons', c => c.isActive && (!c.expiryDate || c.expiryDate >= now));
  res.json({ success: true, coupons });
});

// Seller: Get Store Coupons
router.get(['/seller', '/seller/my-coupons'], authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    const sellerId = seller ? seller.id : null;
    const coupons = db.findAll('coupons', c => req.user.role === 'admin' || c.sellerId === sellerId);
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch seller coupons.' });
  }
});

// Seller: Create Store Coupon
router.post(['/seller', '/seller/create'], authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit, description } = req.body;
    
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = db.findOne('coupons', c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists.` });
    }

    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);

    const newCoupon = db.insert('coupons', {
      id: `cpn_${uuidv4().substring(0, 8)}`,
      code: cleanCode,
      sellerId: seller ? seller.id : null,
      sellerName: seller ? seller.storeName : 'Marketplace Platform',
      discountType: discountType || 'percentage', // 'percentage' | 'fixed'
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit) : 100,
      usedCount: 0,
      isActive: true,
      description: description || `Special ${discountValue}% off promotional coupon.`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: `Coupon "${cleanCode}" created successfully!`, coupon: newCoupon });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

// Seller: Delete / Deactivate Coupon
router.delete('/seller/:id', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    db.delete('coupons', id);
    res.json({ success: true, message: 'Coupon removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

// Validate & Apply Coupon
router.post('/validate', optionalAuth, (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required.' });
  }

  const subtotal = parseFloat(req.body.cartSubtotal ?? req.body.cartTotal ?? req.body.subtotal ?? req.body.total ?? 0);
  const now = new Date().toISOString();
  const coupon = db.findOne('coupons', c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);

  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid coupon code.' });
  }

  if (coupon.expiryDate && coupon.expiryDate < now) {
    return res.status(400).json({ success: false, message: `Coupon "${coupon.code}" has expired.` });
  }

  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: `Coupon "${coupon.code}" has reached maximum usage limit.` });
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Coupon requires a minimum cart subtotal of $${coupon.minOrderValue.toFixed(2)}.`
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'shipping') {
    discountAmount = coupon.discountValue; // free shipping allowance
  }

  discountAmount = +discountAmount.toFixed(2);

  res.json({
    success: true,
    valid: true,
    discountAmount,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      description: coupon.description
    },
    message: `Coupon "${coupon.code}" applied! You saved $${discountAmount.toFixed(2)}.`
  });
});

module.exports = router;
