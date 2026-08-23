const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Toggle Follow/Unfollow a Seller
router.post('/toggle', authenticate, (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID is required.' });
    }

    const seller = db.findById('sellers', sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller store not found.' });
    }

    const existing = db.findOne('follows', f => f.customerId === req.user.id && f.sellerId === sellerId);
    let isFollowing = false;

    if (existing) {
      db.delete('follows', existing.id);
      isFollowing = false;
    } else {
      db.insert('follows', {
        id: `fol_${uuidv4().substring(0, 8)}`,
        customerId: req.user.id,
        sellerId,
        createdAt: new Date().toISOString()
      });
      isFollowing = true;

      // Notify seller
      if (seller.userId) {
        db.insert('notifications', {
          id: `notif_${uuidv4().substring(0, 8)}`,
          userId: seller.userId,
          title: '❤️ New Store Follower!',
          message: `${req.user.name} followed your store.`,
          type: 'seller',
          read: false,
          link: '/seller?tab=overview',
          createdAt: new Date().toISOString()
        });
      }
    }

    const totalFollowers = db.findAll('follows', f => f.sellerId === sellerId).length;

    res.json({
      success: true,
      isFollowing,
      totalFollowers,
      message: isFollowing ? `You are now following ${seller.storeName}!` : `Unfollowed ${seller.storeName}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update store follow status.' });
  }
});

// Check if customer follows a specific seller
router.get('/check/:sellerId', authenticate, (req, res) => {
  try {
    const { sellerId } = req.params;
    const existing = db.findOne('follows', f => f.customerId === req.user.id && f.sellerId === sellerId);
    const totalFollowers = db.findAll('follows', f => f.sellerId === sellerId).length;

    res.json({
      success: true,
      isFollowing: !!existing,
      totalFollowers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not check follow status.' });
  }
});

// Get List of Stores Followed by Customer
router.get(['/following', '/my-following'], authenticate, (req, res) => {
  try {
    const follows = db.findAll('follows', f => f.customerId === req.user.id);
    const stores = follows.map(f => {
      const seller = db.findById('sellers', f.sellerId);
      const productCount = seller ? db.findAll('products', p => p.sellerId === seller.id && p.status === 'approved').length : 0;
      return {
        followId: f.id,
        sellerId: f.sellerId,
        storeName: seller ? seller.storeName : 'Merchant Store',
        logo: seller ? seller.logo : null,
        description: seller ? seller.description : '',
        rating: seller ? seller.rating : 4.8,
        productCount,
        followedAt: f.createdAt
      };
    });

    res.json({ success: true, followedStores: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch followed stores.' });
  }
});

module.exports = router;
