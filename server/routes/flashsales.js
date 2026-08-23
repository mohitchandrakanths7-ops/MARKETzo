const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Public: Get Active Flash Sales
router.get('/active', (req, res) => {
  try {
    const now = new Date().toISOString();
    const flashSales = db.findAll('flashSales', f => 
      f.status === 'active' && 
      f.startTime <= now && 
      f.endTime >= now && 
      (f.saleStockRemaining === undefined || f.saleStockRemaining > 0)
    );

    // Populate product details
    const populated = flashSales.map(fs => {
      const product = db.findById('products', fs.productId);
      return {
        ...fs,
        product: product ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          rating: product.rating,
          reviewCount: product.reviewCount,
          categoryName: product.categoryName || 'Featured'
        } : null
      };
    });

    res.json({ success: true, flashSales: populated });
  } catch (err) {
    console.error('Get flash sales error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch flash sales.' });
  }
});

// Seller / Admin: Get all flash sales
router.get('/all', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    const sellerId = seller ? seller.id : null;

    const list = db.findAll('flashSales', f => req.user.role === 'admin' || (sellerId && f.sellerId === sellerId));
    list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    res.json({ success: true, flashSales: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch flash sales.' });
  }
});

// Create Flash Sale
router.post(['/', '/create'], authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { productId, salePrice, durationHours, saleStock } = req.body;
    if (!productId || !salePrice) {
      return res.status(400).json({ success: false, message: 'Product ID and sale price are required.' });
    }

    const product = db.findById('products', productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (product.sellerId !== seller?.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only create flash sales for your own products.' });
    }

    const priceNum = parseFloat(salePrice);
    const origPrice = product.price || 100;
    const discountPercent = Math.max(1, Math.round(((origPrice - priceNum) / origPrice) * 100));
    const hours = parseInt(durationHours) || 24;
    const stockLimit = parseInt(saleStock) || 20;

    const flashSale = db.insert('flashSales', {
      id: `flash_${uuidv4().substring(0, 8)}`,
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      originalPrice: origPrice,
      salePrice: priceNum,
      discountPercent,
      saleStockTotal: stockLimit,
      saleStockRemaining: stockLimit,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + (hours * 3600000)).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Flash sale launched successfully!', flashSale });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create flash sale.' });
  }
});

module.exports = router;
