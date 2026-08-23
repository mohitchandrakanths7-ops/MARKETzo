const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Seller: Get Verification Status
router.get('/status', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    const sellerId = seller ? seller.id : 'sel_01';
    const request = db.findOne('verificationRequests', v => v.sellerId === sellerId);
    res.json({
      success: true,
      hasApplied: !!request,
      verification: request || null,
      assignedBadges: seller?.badges || (request?.assignedBadges || ['verified_seller'])
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve verification status.' });
  }
});

// Seller: Submit Verification Application
router.post('/submit', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { businessType, registrationNumber, taxId, identityProofUrl, businessProofUrl } = req.body;
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

    const existing = db.findOne('verificationRequests', v => v.sellerId === seller.id);
    let result;

    if (existing) {
      result = db.update('verificationRequests', existing.id, {
        businessType: businessType || existing.businessType,
        registrationNumber: registrationNumber || existing.registrationNumber,
        taxId: taxId || existing.taxId,
        identityProofUrl: identityProofUrl || existing.identityProofUrl,
        businessProofUrl: businessProofUrl || existing.businessProofUrl,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
    } else {
      result = db.insert('verificationRequests', {
        id: `verif_${uuidv4().substring(0, 8)}`,
        sellerId: seller.id,
        sellerName: seller.storeName,
        businessType: businessType || 'Proprietorship / Company',
        registrationNumber: registrationNumber || 'GSTIN-PENDING',
        taxId: taxId || 'EIN-PENDING',
        identityProofUrl: identityProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        businessProofUrl: businessProofUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        assignedBadges: ['verified_seller'],
        adminNotes: null,
        submittedAt: new Date().toISOString(),
        reviewedAt: null
      });
    }

    res.json({ success: true, message: 'Verification application submitted for review.', verification: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit verification.' });
  }
});

// Admin: List All Verification Requests
router.get('/admin/list', authenticate, requireRole('admin'), (req, res) => {
  try {
    const list = db.findAll('verificationRequests', () => true);
    list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json({ success: true, verifications: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch verifications.' });
  }
});

// Admin: Review and Assign Badges
router.all(['/admin/review', '/admin/:id/review'], authenticate, requireRole('admin'), (req, res) => {
  try {
    const id = req.params.id || req.body.verificationId || req.body.id;
    const { status, assignedBadges, adminNotes, adminFeedback } = req.body; // status: 'approved' | 'rejected' | 'action_required'

    const request = db.findById('verificationRequests', id);
    if (!request) return res.status(404).json({ success: false, message: 'Verification request not found.' });

    const badges = Array.isArray(assignedBadges) ? assignedBadges : ['verified_seller'];
    const updated = db.update('verificationRequests', id, {
      status,
      assignedBadges: status === 'approved' ? badges : [],
      adminNotes: adminNotes || adminFeedback || (status === 'approved' ? 'Verified by platform compliance team.' : 'Verification declined.'),
      reviewedAt: new Date().toISOString()
    });

    // Update seller badges on seller record
    if (request.sellerId) {
      db.update('sellers', request.sellerId, {
        isVerified: status === 'approved',
        badges: status === 'approved' ? badges : []
      });
    }

    res.json({ success: true, message: `Seller verification status updated to ${status}.`, verification: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update verification status.' });
  }
});

module.exports = router;
