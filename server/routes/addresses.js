const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get User Addresses
router.get('/', authenticate, (req, res) => {
  const addresses = db.findAll('addresses', a => a.userId === req.user.id);
  res.json({ success: true, addresses });
});

// Add New Address
router.post('/', authenticate, (req, res) => {
  const { fullName, phone, street, city, state, pincode, country = 'United States', type = 'Home', isDefault = false } = req.body;

  if (!fullName || !phone || !street || !city || !state || !pincode) {
    return res.status(400).json({ success: false, message: 'All address fields are required.' });
  }

  // If this address is set as default, unset others
  if (isDefault) {
    const existing = db.findAll('addresses', a => a.userId === req.user.id);
    for (const a of existing) {
      db.update('addresses', a.id, { isDefault: false });
    }
  }

  const newAddress = {
    id: `addr_${uuidv4().substring(0, 8)}`,
    userId: req.user.id,
    fullName,
    phone,
    street,
    city,
    state,
    pincode,
    country,
    type,
    isDefault: !!isDefault
  };

  db.insert('addresses', newAddress);
  res.status(201).json({ success: true, address: newAddress, message: 'Address saved!' });
});

// Update Address
router.put('/:addressId', authenticate, (req, res) => {
  const { addressId } = req.params;
  const address = db.findById('addresses', addressId);

  if (!address || address.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Address not found.' });
  }

  const { fullName, phone, street, city, state, pincode, country, type, isDefault } = req.body;

  if (isDefault) {
    const existing = db.findAll('addresses', a => a.userId === req.user.id && a.id !== addressId);
    for (const a of existing) {
      db.update('addresses', a.id, { isDefault: false });
    }
  }

  const updated = db.update('addresses', addressId, {
    ...(fullName && { fullName }),
    ...(phone && { phone }),
    ...(street && { street }),
    ...(city && { city }),
    ...(state && { state }),
    ...(pincode && { pincode }),
    ...(country && { country }),
    ...(type && { type }),
    ...(isDefault !== undefined && { isDefault })
  });

  res.json({ success: true, message: 'Address updated.', address: updated });
});

// Delete Address
router.delete('/:addressId', authenticate, (req, res) => {
  const { addressId } = req.params;
  const address = db.findById('addresses', addressId);

  if (!address || address.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Address not found.' });
  }

  db.delete('addresses', addressId);
  res.json({ success: true, message: 'Address removed.' });
});

module.exports = router;
