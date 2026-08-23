const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const REASON_LABELS = {
  'damaged_product': 'Damaged during transit / broken item',
  'defective': 'Defective / Not functioning properly',
  'wrong_product': 'Wrong product or variant delivered',
  'missing_items': 'Missing parts or accessories in box',
  'not_as_described': 'Product significantly different from description',
  'not_received': 'Package marked delivered but not received'
};

// Customer: Create Return/Refund Dispute
router.post(['/', '/create'], authenticate, (req, res) => {
  try {
    const { orderId, reason, description, images } = req.body;

    if (!orderId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Order ID, return reason, and description are required.' });
    }

    const order = db.findById('orders', orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only request protection for your own orders.' });
    }

    // Check if dispute already exists for this order
    const existing = db.findOne('disputes', d => d.orderId === orderId && !['resolved_refund', 'rejected'].includes(d.status));
    if (existing) {
      return res.status(400).json({ success: false, message: 'An active dispute is already open for this order.' });
    }

    const sellerId = order.sellerIds && order.sellerIds.length > 0 ? order.sellerIds[0] : (order.items[0]?.sellerId || 'sel_01');
    const seller = db.findById('sellers', sellerId);

    const dispute = db.insert('disputes', {
      id: `dsp_${uuidv4().substring(0, 8)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: req.user.id,
      customerName: req.user.name,
      sellerId: seller ? seller.id : sellerId,
      sellerName: seller ? seller.storeName : 'Merchant Store',
      reason,
      reasonLabel: REASON_LABELS[reason] || 'Return / Refund Request',
      description: description.trim(),
      images: Array.isArray(images) ? images : [],
      requestedAmount: order.totalAmount,
      status: 'pending_seller', // 'pending_seller' | 'seller_replied' | 'under_review' | 'resolved_refund' | 'rejected'
      sellerResponse: null,
      sellerResponseAt: null,
      adminResolution: null,
      adminResolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date().toISOString()
    });

    // Notify seller
    if (seller && seller.userId) {
      db.insert('notifications', {
        id: `notif_${uuidv4().substring(0, 8)}`,
        userId: seller.userId,
        title: `🛡️ Buyer Protection Request on #${order.orderNumber}`,
        message: `Customer requested protection: ${REASON_LABELS[reason] || reason}`,
        type: 'seller',
        read: false,
        link: '/seller?tab=disputes',
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, message: 'Dispute request registered successfully.', dispute });
  } catch (err) {
    console.error('Create dispute error:', err);
    res.status(500).json({ success: false, message: 'Could not create dispute.' });
  }
});

// Customer: Get My Disputes
router.get('/my-disputes', authenticate, (req, res) => {
  try {
    const disputes = db.findAll('disputes', d => d.customerId === req.user.id);
    disputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer disputes.' });
  }
});

// Seller: Get Store Disputes
router.get('/seller', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    const sellerId = seller ? seller.id : null;
    const disputes = db.findAll('disputes', d => !sellerId || d.sellerId === sellerId);
    disputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch seller disputes.' });
  }
});

// Seller: Respond to Dispute
router.post('/:id/respond', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { sellerResponse } = req.body;

    if (!sellerResponse || !sellerResponse.trim()) {
      return res.status(400).json({ success: false, message: 'Seller response is required.' });
    }

    const dispute = db.findById('disputes', id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found.' });

    const updated = db.update('disputes', id, {
      status: 'seller_replied',
      sellerResponse: sellerResponse.trim(),
      sellerResponseAt: new Date().toISOString()
    });

    // Notify customer
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: dispute.customerId,
      title: `Seller Response on Dispute #${dispute.orderNumber}`,
      message: `The seller has posted a response to your claim.`,
      type: 'order',
      read: false,
      link: '/account?tab=disputes',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Seller response recorded.', dispute: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record response.' });
  }
});

// Admin: Get All Disputes
router.get('/admin', authenticate, requireRole('admin'), (req, res) => {
  try {
    const disputes = db.findAll('disputes', () => true);
    disputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin disputes.' });
  }
});

// Admin: Arbitrate and Resolve
router.all(['/:id/admin-resolve', '/admin/:id/resolve'], authenticate, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { decision, resolution, notes } = req.body;
    const dec = resolution || decision;

    const dispute = db.findById('disputes', id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found.' });

    const newStatus = (dec === 'approve_refund' || dec === 'resolved_refund') ? 'resolved_refund' : 'rejected';
    const updated = db.update('disputes', id, {
      status: newStatus,
      adminResolution: dec,
      adminResolutionNotes: notes ? notes.trim() : 'Arbitrated by platform panel',
      resolvedAt: new Date().toISOString()
    });

    // Notify customer & seller
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: dispute.customerId,
      title: `🛡️ Marketzo Protection Resolution: #${dispute.orderNumber}`,
      message: decision === 'approve_refund' ? `Your refund of $${dispute.requestedAmount} was approved.` : 'Your dispute claim was reviewed and concluded.',
      type: 'order',
      read: false,
      link: '/account?tab=disputes',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Dispute arbitrated and resolved.', dispute: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resolve dispute.' });
  }
});

module.exports = router;
