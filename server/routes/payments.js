const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

// Simulate Sandbox Payment Verification
router.post('/process', authenticate, async (req, res) => {
  try {
    const { amount, method, paymentDetails } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ success: false, message: 'Amount and payment method are required.' });
    }

    // Simulate 600ms network round-trip for gateway tokenization & verification
    await new Promise(resolve => setTimeout(resolve, 600));

    const transactionId = `TXN_MKZ_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return res.json({
      success: true,
      transactionId,
      status: 'COMPLETED',
      amount: parseFloat(amount),
      method,
      gateway: 'Marketzo Secure Gateway (Sandbox Mode)',
      timestamp: new Date().toISOString(),
      message: 'Payment authorized and captured successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment gateway error.' });
  }
});

module.exports = router;
