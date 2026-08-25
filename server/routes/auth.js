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

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Customer / Merchant / General Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', storeName, description, phone, businessAddress, taxId } = req.body;

    const sanitizedName = (name || '').trim();
    const sanitizedEmail = (email || '').trim().toLowerCase();
    const sanitizedStoreName = (storeName || '').trim();

    console.log(`[AUTH] Registration request received: name="${sanitizedName}", email="${sanitizedEmail}", role="${role}", store="${sanitizedStoreName}"`);

    // 1. Basic validation
    if (!sanitizedName || sanitizedName.length < 2) {
      console.warn(`[AUTH] Registration rejected: invalid name "${sanitizedName}"`);
      return res.status(400).json({ success: false, message: 'Please provide a valid full name (at least 2 characters).' });
    }

    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      console.warn(`[AUTH] Registration rejected: invalid email "${sanitizedEmail}"`);
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      console.warn(`[AUTH] Registration rejected: password too short for email "${sanitizedEmail}"`);
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
    }

    if (role === 'seller' && (!sanitizedStoreName || sanitizedStoreName.length < 2)) {
      console.warn(`[AUTH] Merchant registration rejected: invalid store name "${sanitizedStoreName}"`);
      return res.status(400).json({ success: false, message: 'Store or business name must be at least 2 characters long.' });
    }

    // 2. Duplicate Store Name Check
    if (role === 'seller' && sanitizedStoreName) {
      const existingStore = db.findOne('sellers', s => s.storeName.toLowerCase() === sanitizedStoreName.toLowerCase());
      const existingUser = db.findOne('users', u => u.email.toLowerCase() === sanitizedEmail);
      if (existingStore && (!existingUser || existingStore.userId !== existingUser.id)) {
        console.warn(`[AUTH] Merchant registration rejected: store name "${sanitizedStoreName}" already exists`);
        return res.status(400).json({
          success: false,
          message: `A merchant store with the name "${sanitizedStoreName}" is already registered. Please choose a unique store name.`
        });
      }
    }

    // 3. Duplicate User / Email Handling
    const existingUser = db.findOne('users', u => u.email.toLowerCase() === sanitizedEmail);
    if (existingUser) {
      // If user registering as seller with existing email, verify password to auto-upgrade
      if (role === 'seller') {
        const isMatch = bcrypt.compareSync(password, existingUser.password);
        if (isMatch) {
          console.log(`[AUTH] Existing user ${existingUser.id} (${sanitizedEmail}) upgrading to seller via merchant registration form.`);
          
          // Upgrade user to seller role
          const updatedUser = db.update('users', existingUser.id, {
            role: 'seller',
            ...(sanitizedName && { name: sanitizedName }),
            ...(phone && { phone: phone.trim() })
          });

          // Create or update seller profile
          let sellerProfile = db.findOne('sellers', s => s.userId === existingUser.id);
          const finalStoreName = sanitizedStoreName || `${existingUser.name}'s Store`;
          if (!sellerProfile) {
            sellerProfile = {
              id: `sel_${uuidv4().substring(0, 8)}`,
              userId: existingUser.id,
              storeName: finalStoreName,
              slug: finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalStoreName)}`,
              banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
              description: description || 'Authorized marketplace vendor providing verified authentic merchandise.',
              rating: 5.0,
              reviewCount: 0,
              status: 'approved',
              commissionRate: 10.0,
              businessAddress: businessAddress || '100 Marketzo Commerce Ave',
              phone: phone ? phone.trim() : (existingUser.phone || ''),
              taxId: taxId || 'TAX-PENDING',
              joinedAt: new Date().toISOString()
            };
            db.insert('sellers', sellerProfile);
          } else {
            sellerProfile = db.update('sellers', sellerProfile.id, {
              storeName: finalStoreName,
              slug: finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              ...(description && { description }),
              status: 'approved'
            });
          }

          const token = generateToken(updatedUser);
          const { password: _, ...safeUser } = updatedUser;

          return res.status(200).json({
            success: true,
            message: 'Merchant store launched successfully! Welcome to your Merchant Portal.',
            token,
            user: safeUser,
            seller: sellerProfile
          });
        } else {
          console.warn(`[AUTH] Registration rejected: email "${sanitizedEmail}" already registered with different password.`);
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please sign in with your password to upgrade to a merchant store.'
          });
        }
      } else {
        console.warn(`[AUTH] Registration rejected: duplicate email "${sanitizedEmail}"`);
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      }
    }

    // 4. Create New User
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: role === 'seller' ? 'seller' : 'customer',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sanitizedName)}`,
      phone: phone ? phone.trim() : '',
      createdAt: new Date().toISOString()
    };

    db.insert('users', newUser);

    let sellerProfile = null;
    if (role === 'seller') {
      const finalStoreName = sanitizedStoreName || `${sanitizedName}'s Store`;
      sellerProfile = {
        id: `sel_${uuidv4().substring(0, 8)}`,
        userId: newUser.id,
        storeName: finalStoreName,
        slug: finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalStoreName)}`,
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        description: description || 'Authorized marketplace vendor providing verified authentic merchandise.',
        rating: 5.0,
        reviewCount: 0,
        status: 'approved',
        commissionRate: 10.0,
        businessAddress: businessAddress || '100 Marketzo Commerce Ave',
        phone: phone ? phone.trim() : '',
        taxId: taxId || 'TAX-PENDING',
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
      title: role === 'seller' ? 'Welcome Merchant! 🏪' : 'Welcome to Marketzo! 🛍️',
      message: role === 'seller'
        ? `Your merchant store "${sellerProfile?.storeName}" is live and ready for listing products.`
        : 'Explore millions of authentic products, exclusive flash discounts, and rapid delivery.',
      type: 'account',
      read: false,
      link: role === 'seller' ? '/seller' : '/',
      createdAt: new Date().toISOString()
    });

    console.log(`[AUTH] New user created successfully: id=${newUser.id}, email="${sanitizedEmail}", role="${newUser.role}"`);

    return res.status(201).json({
      success: true,
      message: role === 'seller' ? 'Merchant store registered and launched successfully!' : 'Account registered successfully!',
      token,
      user: safeUser,
      seller: sellerProfile
    });
  } catch (err) {
    console.error('[AUTH] Registration server error:', err.message, err.stack);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
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
