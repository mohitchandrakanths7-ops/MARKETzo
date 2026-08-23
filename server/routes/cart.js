const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get User Cart
router.get('/', authenticate, (req, res) => {
  try {
    const rawItems = db.findAll('cart', item => item.userId === req.user.id);
    
    // Populate product information
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
          stock: product.stock,
          quantity: item.quantity,
          variant: item.variant || null,
          savedForLater: !!item.savedForLater,
          sellerName: seller ? seller.storeName : 'Marketzo Merchant',
          sellerId: product.sellerId
        });
      }
    }

    const activeItems = items.filter(i => !i.savedForLater);
    const savedItems = items.filter(i => i.savedForLater);

    const subtotal = activeItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const originalSubtotal = activeItems.reduce((sum, i) => sum + ((i.originalPrice || i.price) * i.quantity), 0);
    const totalDiscount = originalSubtotal - subtotal;
    const shippingFee = subtotal > 50 || activeItems.length === 0 ? 0 : 9.99;
    const estimatedTax = +(subtotal * 0.08).toFixed(2);
    const totalAmount = +(subtotal + shippingFee + estimatedTax).toFixed(2);

    res.json({
      success: true,
      items: activeItems,
      savedForLater: savedItems,
      summary: {
        itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: +subtotal.toFixed(2),
        originalSubtotal: +originalSubtotal.toFixed(2),
        totalDiscount: +totalDiscount.toFixed(2),
        shippingFee,
        estimatedTax,
        totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load cart.' });
  }
});

// Add Item to Cart
router.post('/add', authenticate, (req, res) => {
  try {
    const { productId, quantity = 1, variant = null } = req.body;

    const product = db.findById('products', productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const existing = db.findOne('cart', i => 
      i.userId === req.user.id && 
      i.productId === productId && 
      i.variant === variant &&
      !i.savedForLater
    );

    if (existing) {
      const newQty = existing.quantity + parseInt(quantity);
      db.update('cart', existing.id, { quantity: newQty });
    } else {
      db.insert('cart', {
        id: `crt_${uuidv4().substring(0, 8)}`,
        userId: req.user.id,
        productId,
        quantity: parseInt(quantity),
        variant,
        savedForLater: false,
        addedAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Added to cart successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// Update Quantity
router.put('/update-quantity', authenticate, (req, res) => {
  const { cartItemId, quantity } = req.body;
  if (!cartItemId || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Cart item ID and quantity are required.' });
  }

  const cartItem = db.findById('cart', cartItemId);
  if (!cartItem || cartItem.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Cart item not found.' });
  }

  if (parseInt(quantity) <= 0) {
    db.delete('cart', cartItemId);
    return res.json({ success: true, message: 'Item removed from cart.' });
  }

  db.update('cart', cartItemId, { quantity: parseInt(quantity) });
  res.json({ success: true, message: 'Quantity updated.' });
});

// Remove item from cart
router.delete('/remove/:cartItemId', authenticate, (req, res) => {
  const { cartItemId } = req.params;
  const item = db.findById('cart', cartItemId);
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Cart item not found.' });
  }

  db.delete('cart', cartItemId);
  res.json({ success: true, message: 'Item removed from cart.' });
});

// Toggle Save for Later
router.put('/save-for-later/:cartItemId', authenticate, (req, res) => {
  const { cartItemId } = req.params;
  const item = db.findById('cart', cartItemId);
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Cart item not found.' });
  }

  const updated = db.update('cart', cartItemId, { savedForLater: !item.savedForLater });
  res.json({
    success: true,
    message: updated.savedForLater ? 'Moved to Saved for Later.' : 'Moved back to Cart.',
    savedForLater: updated.savedForLater
  });
});

// Clear Cart
router.delete('/clear', authenticate, (req, res) => {
  db.delete('cart', item => item.userId === req.user.id && !item.savedForLater);
  res.json({ success: true, message: 'Cart cleared.' });
});

module.exports = router;
