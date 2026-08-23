const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Seller: Get Wallet Summary
router.get('/summary', authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Seller account not found.' });
    }

    const sellerId = seller ? seller.id : 'sel_01';
    const orders = db.findAll('orders', o => o.sellerIds && o.sellerIds.includes(sellerId) && o.orderStatus !== 'Cancelled');
    
    // Calculate balances
    let grossDelivered = 0;
    let grossPending = 0;
    const commissionRate = (seller?.commissionRate || 8.5) / 100;

    for (const ord of orders) {
      const items = (ord.items || []).filter(it => it.sellerId === sellerId);
      const subtotal = items.reduce((acc, it) => acc + ((it.price || 0) * (it.quantity || 1)), 0);

      if (ord.orderStatus === 'Delivered') {
        grossDelivered += subtotal;
      } else {
        grossPending += subtotal;
      }
    }

    const platformFees = grossDelivered * commissionRate;
    const netDeliveredEarnings = grossDelivered - platformFees;

    // Completed or Pending Payouts
    const payouts = db.findAll('payoutRequests', p => p.sellerId === sellerId);
    const paidOut = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingWithdrawal = payouts.filter(p => ['pending', 'processing'].includes(p.status)).reduce((sum, p) => sum + (p.amount || 0), 0);

    const availableBalance = Math.max(0, netDeliveredEarnings - paidOut - pendingWithdrawal);

    const transactions = db.findAll('walletTransactions', t => t.sellerId === sellerId);
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    payouts.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

    res.json({
      success: true,
      wallet: {
        balance: +availableBalance.toFixed(2),
        availableBalance: +availableBalance.toFixed(2),
        pendingBalance: +(grossPending * (1 - commissionRate)).toFixed(2),
        totalGrossDelivered: +grossDelivered.toFixed(2),
        platformFees: +platformFees.toFixed(2),
        totalNetEarnings: +netDeliveredEarnings.toFixed(2),
        totalWithdrawn: +paidOut.toFixed(2),
        pendingWithdrawal: +pendingWithdrawal.toFixed(2),
        payoutBank: seller?.payoutBank || 'Configured Bank Account'
      },
      transactions: transactions.slice(0, 15),
      payouts: payouts.slice(0, 15)
    });
  } catch (err) {
    console.error('Wallet summary error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch wallet details.' });
  }
});

// Seller: Submit Withdrawal Request
router.post(['/withdraw', '/request-payout'], authenticate, requireRole('seller', 'admin'), (req, res) => {
  try {
    const { amount, payoutMethod, accountDetails } = req.body;
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid withdrawal amount.' });
    }

    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller && req.user.role !== 'admin') return res.status(404).json({ success: false, message: 'Seller not found.' });
    const sellerId = seller ? seller.id : 'sel_01';

    const payout = db.insert('payoutRequests', {
      id: `pay_${uuidv4().substring(0, 8)}`,
      sellerId,
      sellerStoreName: seller ? seller.storeName : 'Merchant Store',
      amount: amountNum,
      payoutMethod: payoutMethod || 'Bank Wire (NEFT/RTGS)',
      accountDetails: accountDetails || seller?.payoutBank || 'Standard Bank Account',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: null,
      referenceId: null
    });

    db.insert('walletTransactions', {
      id: `wtx_${uuidv4().substring(0, 8)}`,
      sellerId,
      type: 'debit',
      amount: amountNum,
      description: `Withdrawal request submitted (#${payout.id})`,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted for settlement.', payout, payoutRequest: payout });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit withdrawal request.' });
  }
});

// Admin: Get All Payout Requests
router.get('/admin/payouts', authenticate, requireRole('admin'), (req, res) => {
  try {
    const payouts = db.findAll('payoutRequests', () => true);
    payouts.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    res.json({ success: true, payouts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payouts.' });
  }
});

// Admin: Process/Complete Payout
router.all(['/admin/payouts/:id/status', '/admin/payouts/:id/process'], authenticate, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, referenceId, referenceNumber } = req.body; // status: 'processing' | 'completed' | 'failed'

    const payout = db.findById('payoutRequests', id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout request not found.' });

    const updated = db.update('payoutRequests', id, {
      status: status || 'completed',
      referenceId: referenceId || referenceNumber || `TXN_SETTLE_${Date.now()}`,
      processedAt: status === 'completed' ? new Date().toISOString() : payout.processedAt
    });

    res.json({ success: true, message: `Payout request marked as ${status}.`, payout: updated, payoutRequest: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update payout status.' });
  }
});

module.exports = router;
