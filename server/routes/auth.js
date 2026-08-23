const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Customer / General Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', storeName, description } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'seller' ? 'seller' : 'customer',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      phone: req.body.phone || '',
      createdAt: new Date().toISOString()
    };

    db.insert('users', newUser);

    let sellerProfile = null;
    if (role === 'seller') {
      sellerProfile = {
        id: `sel_${uuidv4().substring(0, 8)}`,
        userId: newUser.id,
        storeName: storeName || `${name}'s Store`,
        slug: (storeName || `${name}-store`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(storeName || name)}`,
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        description: description || 'Authorized marketplace vendor providing verified authentic merchandise.',
        rating: 5.0,
        reviewCount: 0,
        status: 'approved', // instantly approved for demo
        commissionRate: 10.0,
        businessAddress: req.body.businessAddress || '100 Marketzo Commerce Ave',
        taxId: req.body.taxId || 'TAX-PENDING',
        joinedAt: new Date().toISOString()
      };
      db.insert('sellers', sellerProfile);
    }

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    // Send welcome notification
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: newUser.id,
      title: 'Welcome to Marketzo! 🛍️',
      message: 'Explore millions of authentic products, exclusive flash discounts, and rapid delivery.',
      type: 'account',
      read: false,
      link: '/',
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: safeUser,
      seller: sellerProfile
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    const seller = user.role === 'seller' ? db.findOne('sellers', s => s.userId === user.id) : null;

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser,
      seller
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Demo Persona Quick-Login
router.post('/demo-login', (req, res) => {
  try {
    const { role } = req.body; // 'customer' | 'seller' | 'admin'
    let targetEmail = 'alex@marketzo.com';
    if (role === 'seller') targetEmail = 'techstore@marketzo.com';
    if (role === 'admin') targetEmail = 'admin@marketzo.com';

    const user = db.findOne('users', u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo persona user not found in database.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    const seller = user.role === 'seller' ? db.findOne('sellers', s => s.userId === user.id) : null;

    return res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()} (${user.name})`,
      token,
      user: safeUser,
      seller
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Demo login error.' });
  }
});

// Get Current User Profile
router.get('/me', authenticate, (req, res) => {
  const seller = req.user.role === 'seller' ? db.findOne('sellers', s => s.userId === req.user.id) : null;
  res.json({
    success: true,
    user: req.user,
    seller
  });
});

// Upgrade / Launch Merchant Store
router.post('/become-seller', authenticate, (req, res) => {
  try {
    const { storeName, description, phone, logo, banner, businessAddress, taxId } = req.body;

    if (!storeName || storeName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Store or business name must be at least 2 characters long.'
      });
    }

    const trimmedStoreName = storeName.trim();

    // 1. Upgrade user role to 'seller' if not already
    const updatedUser = db.update('users', req.user.id, {
      role: 'seller',
      ...(phone !== undefined && { phone: phone ? phone.trim() : req.user.phone })
    });

    // 2. Check if a seller profile already exists
    let seller = db.findOne('sellers', s => s.userId === req.user.id);

    if (seller) {
      // Update existing seller profile
      seller = db.update('sellers', seller.id, {
        storeName: trimmedStoreName,
        slug: trimmedStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ...(description !== undefined && { description: description.trim() }),
        ...(logo && { logo }),
        ...(banner && { banner }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : (seller.phone || req.user.phone || '') }),
        ...(businessAddress && { businessAddress }),
        ...(taxId && { taxId }),
        status: 'approved'
      });
    } else {
      // Create new seller profile
      seller = {
        id: `sel_${uuidv4().substring(0, 8)}`,
        userId: req.user.id,
        storeName: trimmedStoreName,
        slug: trimmedStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedStoreName)}`,
        banner: banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        description: description || 'Authorized marketplace vendor providing verified authentic merchandise.',
        rating: 5.0,
        reviewCount: 0,
        status: 'approved',
        commissionRate: 10.0,
        businessAddress: businessAddress || '100 Marketzo Commerce Ave',
        phone: phone ? phone.trim() : (req.user.phone || ''),
        taxId: taxId || 'TAX-PENDING',
        joinedAt: new Date().toISOString()
      };
      db.insert('sellers', seller);
    }

    // 3. Issue fresh JWT token with upgraded 'seller' role
    const token = generateToken(updatedUser);
    const { password: _, ...safeUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Merchant store launched successfully! Welcome to your Merchant Portal.',
      token,
      user: safeUser,
      seller
    });
  } catch (err) {
    console.error('Become seller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while launching merchant store.'
    });
  }
});

// Update Profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, phone, avatar, storeName, storeDescription, storeLogo } = req.body;

    if (name !== undefined && (!name || name.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long.' });
    }

    let isUpgradingToSeller = false;
    if (storeName && storeName.trim().length >= 2 && req.user.role !== 'seller') {
      isUpgradingToSeller = true;
    }

    const updated = db.update('users', req.user.id, {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : '' }),
      ...(avatar !== undefined && { avatar }),
      ...(isUpgradingToSeller && { role: 'seller' })
    });

    let seller = null;
    if (req.user.role === 'seller' || isUpgradingToSeller) {
      const existingSeller = db.findOne('sellers', s => s.userId === req.user.id);
      if (existingSeller) {
        seller = db.update('sellers', existingSeller.id, {
          ...(storeName && { storeName: storeName.trim() }),
          ...(storeDescription !== undefined && { description: storeDescription }),
          ...(storeLogo && { logo: storeLogo }),
          ...(phone !== undefined && { phone: phone ? phone.trim() : '' })
        });
      } else if (storeName && storeName.trim()) {
        const trimmedStoreName = storeName.trim();
        seller = {
          id: `sel_${uuidv4().substring(0, 8)}`,
          userId: req.user.id,
          storeName: trimmedStoreName,
          slug: trimmedStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          logo: storeLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedStoreName)}`,
          banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
          description: storeDescription || 'Authorized marketplace vendor providing verified authentic merchandise.',
          rating: 5.0,
          reviewCount: 0,
          status: 'approved',
          commissionRate: 10.0,
          businessAddress: '100 Marketzo Commerce Ave',
          phone: phone ? phone.trim() : (req.user.phone || ''),
          taxId: 'TAX-PENDING',
          joinedAt: new Date().toISOString()
        };
        db.insert('sellers', seller);
      }
    }

    const token = generateToken(updated);
    const { password: _, ...safeUser } = updated;
    res.json({
      success: true,
      token,
      user: safeUser,
      seller,
      message: 'Profile updated successfully!'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

module.exports = router;
