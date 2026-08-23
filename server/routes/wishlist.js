const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get Wishlist items
router.get('/', authenticate, (req, res) => {
  try {
    const rawItems = db.findAll('wishlist', w => w.userId === req.user.id);
    const items = [];

    for (const item of rawItems) {
      const product = db.findById('products', item.productId);
      if (product) {
        const seller = db.findById('sellers', product.sellerId);
        items.push({
          id: item.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercent: product.discountPercent,
          image: product.images[0],
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          sellerName: seller ? seller.storeName : 'Marketzo Merchant',
          addedAt: item.addedAt
        });
      }
    }

    res.json({ success: true, wishlist: items, count: items.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load wishlist.' });
  }
});

// Toggle Wishlist item (Add if not in wishlist, remove if already present)
router.post('/toggle', authenticate, (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const existing = db.findOne('wishlist', w => w.userId === req.user.id && w.productId === productId);

    if (existing) {
      db.delete('wishlist', existing.id);
      return res.json({
        success: true,
        inWishlist: false,
        message: 'Removed from your wishlist'
      });
    } else {
      const newItem = {
        id: `wsh_${uuidv4().substring(0, 8)}`,
        userId: req.user.id,
        productId,
        addedAt: new Date().toISOString()
      };
      db.insert('wishlist', newItem);
      return res.json({
        success: true,
        inWishlist: true,
        message: 'Saved to your wishlist!'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Wishlist update failed.' });
  }
});

module.exports = router;
