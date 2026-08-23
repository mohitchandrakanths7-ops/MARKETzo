const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Get Wholesale Tier Pricing & MOQ for a Product
router.get('/product/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = db.findById('products', id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const basePrice = product.price || 100;
    const moq = product.moq || 5;

    // Standard Wholesale Tier Structure (e.g. 5–19 units, 20–49 units, 50+ units)
    const tiers = product.wholesaleTiers || [
      { minQty: 1, maxQty: moq - 1, pricePerUnit: basePrice, label: 'Retail Price' },
      { minQty: moq, maxQty: 19, pricePerUnit: +(basePrice * 0.90).toFixed(2), discountPercent: 10, label: `${moq}+ Units` },
      { minQty: 20, maxQty: 49, pricePerUnit: +(basePrice * 0.82).toFixed(2), discountPercent: 18, label: '20+ Units' },
      { minQty: 50, maxQty: 9999, pricePerUnit: +(basePrice * 0.72).toFixed(2), discountPercent: 28, label: '50+ Units' }
    ];

    res.json({
      success: true,
      productId: product.id,
      productName: product.name,
      retailPrice: basePrice,
      moq,
      tiers,
      tierPricing: tiers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wholesale pricing.' });
  }
});

// Customer: Submit Request for Quote (RFQ)
router.post('/rfq', authenticate, (req, res) => {
  try {
    const { productId, targetQuantity, targetPricePerUnit, shippingDestination, buyerMessage, currency } = req.body;

    if (!productId || !targetQuantity || targetQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Product ID and desired bulk quantity are required.' });
    }

    const product = db.findById('products', productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const seller = db.findById('sellers', product.sellerId);

    const rfq = db.insert('wholesaleRfqs', {
      id: `rfq_${uuidv4().substring(0, 8)}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images ? product.images[0] : null,
      sellerId: product.sellerId,
      sellerName: seller ? seller.storeName : 'Merchant Store',
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      targetQuantity: parseInt(targetQuantity),
      targetPricePerUnit: targetPricePerUnit ? parseFloat(targetPricePerUnit) : +(product.price * 0.8).toFixed(2),
      currency: currency || 'USD',
      shippingDestination: shippingDestination || 'International Destination',
      buyerMessage: buyerMessage ? buyerMessage.trim() : 'Interested in bulk trial procurement.',
      status: 'pending', // 'pending' | 'quoted' | 'accepted' | 'declined' | 'ordered'
      sellerQuote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Notify seller
    if (seller && seller.userId) {
      db.insert('notifications', {
        id: `notif_${uuidv4().substring(0, 8)}`,
        userId: seller.userId,
        title: `📦 New Bulk RFQ Inquiry: ${targetQuantity} units`,
        message: `${req.user.name} requested a quote for ${product.name}.`,
        type: 'seller',
        read: false,
        link: '/seller?tab=wholesale',
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, message: 'Bulk Quote request submitted to seller.', rfq });
  } catch (err) {
    console.error('Submit RFQ error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit RFQ.' });
  }
});

// Customer: Get My RFQ Inquiries
router.get('/my-rfqs', authenticate, (req, res) => {
  try {
    const list = db.findAll('wholesaleRfqs', r => r.customerId === req.user.id);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, rfqs: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFQs.' });
  }
});

// Seller: Get Store RFQs
router.get('/seller-rfqs', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    const sellerId = seller ? seller.id : 'sel_01';

    const list = db.findAll('wholesaleRfqs', r => req.user.role === 'admin' || r.sellerId === sellerId);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, rfqs: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch seller RFQs.' });
  }
});

// Seller: Submit Custom Quote Offer
router.all(['/rfq/:id/quote', '/seller/rfq/:id/quote'], authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { offeredPricePerUnit, minQuantity, shippingCost, estimatedProductionDays, notes } = req.body;

    const rfq = db.findById('wholesaleRfqs', id);
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found.' });

    const quoteObj = {
      offeredPricePerUnit: parseFloat(offeredPricePerUnit),
      minQuantity: parseInt(minQuantity) || rfq.targetQuantity,
      shippingCost: parseFloat(shippingCost) || 0,
      estimatedProductionDays: parseInt(estimatedProductionDays) || 3,
      quoteValidUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: notes ? notes.trim() : 'Official merchant bulk quote offer.'
    };

    const updated = db.update('wholesaleRfqs', id, {
      sellerQuote: quoteObj,
      status: 'quoted',
      updatedAt: new Date().toISOString()
    });

    // Notify customer
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: rfq.customerId,
      title: `💼 Seller Responded with Quote! (${rfq.productName})`,
      message: `Offered $${offeredPricePerUnit}/unit for ${rfq.targetQuantity} units.`,
      type: 'order',
      read: false,
      link: '/account?tab=wholesale',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Quote submitted to buyer.', rfq: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit quote.' });
  }
});

module.exports = router;
