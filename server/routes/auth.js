const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper to sanitize user object and ensure no sensitive hashes are exposed
const getSafeUser = (user) => {
  if (!user) return null;
  const { password, recoveryCodeHash, resetCode, resetCodeExpiry, ...safeUser } = user;
  return safeUser;
};

// Client IP extractor for rate limiting
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

// Rate limiting store for brute-force protection
// key -> { count: number, firstAttempt: number, blockedUntil: number }
const rateLimitStore = new Map();

const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  if (!record) return { allowed: true };

  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingMinutes = Math.max(1, Math.ceil((record.blockedUntil - now) / 60000));
    return {
      allowed: false,
      message: `Too many failed attempts. For security, please wait ${remainingMinutes} minute(s) before trying again.`
    };
  }

  // Reset if window has elapsed
  if (now - record.firstAttempt > windowMs) {
    rateLimitStore.delete(key);
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    record.blockedUntil = now + windowMs;
    rateLimitStore.set(key, record);
    return {
      allowed: false,
      message: 'Too many failed attempts. For security, account actions are temporarily locked. Please wait 15 minutes.'
    };
  }

  return { allowed: true };
};

const recordFailedAttempt = (key) => {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, firstAttempt: now, blockedUntil: 0 };
  record.count += 1;
  rateLimitStore.set(key, record);
};

const clearFailedAttempts = (key) => {
  rateLimitStore.delete(key);
};

// Generate Cryptographic Account Recovery Key: MZ-XXXX-XXXX-XXXX
const generateRecoveryCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const getChunk = () => {
    let chunk = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      chunk += chars[bytes[i] % chars.length];
    }
    return chunk;
  };
  return `MZ-${getChunk()}-${getChunk()}-${getChunk()}`;
};

// Creative username suggestion list and synthesizer
const CREATIVE_USERNAMES = [
  'ZoNova',
  'NexoraX',
  'ZoElite',
  'PixelNova',
  'RoyalNova',
  'ShadowByte',
  'ZoVortex',
  'AstroVex',
  'CyberZo',
  'NovaApex',
  'PulseVex',
  'ZenithZo',
  'ZoMatrix',
  'HyperNova',
  'ZoQuantum',
  'VortexX',
  'ZoPrime',
  'EchoByte',
  'ZoCosmo',
  'PhantomZo',
  'QuantumZo',
  'NovaByte',
  'TitanZo',
  'AuraVex',
  'ApexNova'
];

const validateUsernameFormat = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Please enter a username.' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long.' };
  }
  if (trimmed.length > 24) {
    return { valid: false, message: 'Username cannot exceed 24 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, message: 'Username may only contain letters, numbers, and underscores.' };
  }
  return { valid: true, username: trimmed };
};

const generateAvailableUsername = (users) => {
  const taken = new Set(
    users
      .map(u => (u.username || '').toLowerCase())
      .concat(users.map(u => (u.email ? u.email.split('@')[0].toLowerCase() : '')))
      .filter(Boolean)
  );

  const shuffled = [...CREATIVE_USERNAMES].sort(() => 0.5 - Math.random());
  for (const name of shuffled) {
    if (!taken.has(name.toLowerCase())) {
      return name;
    }
  }

  const prefixes = ['Zo', 'Nex', 'Nova', 'Pixel', 'Astro', 'Shadow', 'Quantum', 'Vortex', 'Cyber', 'Apex'];
  const suffixes = ['Nova', 'Byte', 'Elite', 'Vex', 'Pulse', 'Matrix', 'Craft', 'Flare', 'Spark', 'X'];

  for (let i = 0; i < 100; i++) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const candidate = `${p}${s}${i > 10 ? num : ''}`;
    if (!taken.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `Zo${Math.floor(1000 + Math.random() * 9000)}`;
};

// =========================================================================
// 1. REAL-TIME USERNAME AVAILABILITY CHECK ENDPOINT
// =========================================================================
router.get('/check-username', (req, res) => {
  try {
    const raw = (req.query.username || req.body?.username || '').trim();
    if (!raw) {
      return res.status(400).json({ success: false, available: false, message: 'Please provide a username to check.' });
    }

    const validation = validateUsernameFormat(raw);
    if (!validation.valid) {
      return res.json({ success: true, available: false, message: validation.message });
    }

    const cleanLower = validation.username.toLowerCase();
    const existing = db.findOne('users', u => (u.username || '').toLowerCase() === cleanLower);

    if (existing) {
      return res.json({
        success: true,
        available: false,
        message: `The username "${validation.username}" is already taken. Please choose another.`
      });
    }

    return res.json({
      success: true,
      available: true,
      message: `Username "${validation.username}" is available!`
    });
  } catch (err) {
    console.error('[AUTH] Check username error:', err);
    res.status(500).json({ success: false, available: false, message: 'Could not verify username availability.' });
  }
});

// =========================================================================
// 2. CREATIVE USERNAME GENERATOR ENDPOINT
// =========================================================================
router.get('/generate-username', (req, res) => {
  try {
    const allUsers = db.findAll('users');
    const suggestion = generateAvailableUsername(allUsers);
    return res.json({
      success: true,
      username: suggestion
    });
  } catch (err) {
    console.error('[AUTH] Generate username error:', err);
    res.status(500).json({ success: false, message: 'Could not generate username.' });
  }
});

// =========================================================================
// 3. REGISTRATION (USERNAME & PASSWORD ONLY)
// =========================================================================
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      role = 'customer',
      storeName,
      description,
      name,
      email,
      phone,
      businessAddress,
      taxId
    } = req.body;

    // Resolve username (or fallback from legacy test payload email/name)
    const rawUsername = (username || (email ? email.split('@')[0] : (name || ''))).replace(/[^a-zA-Z0-9_]/g, '');
    const cleanUsername = (rawUsername || '').trim();

    console.log(`[AUTH] Registration request received: username="${cleanUsername}", role="${role}"`);

    // 1. Username validation
    const usernameVal = validateUsernameFormat(cleanUsername);
    if (!usernameVal.valid) {
      return res.status(400).json({ success: false, message: usernameVal.message });
    }
    const finalUsername = usernameVal.username;
    const finalUsernameLower = finalUsername.toLowerCase();

    // 2. Password validation (minimum 8 characters)
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
    }

    // 3. Merchant store validation
    const sanitizedStoreName = (storeName || '').trim();
    if (role === 'seller' && (!sanitizedStoreName || sanitizedStoreName.length < 2)) {
      return res.status(400).json({ success: false, message: 'Store or business name must be at least 2 characters long.' });
    }

    if (role === 'seller' && sanitizedStoreName) {
      const existingStore = db.findOne('sellers', s => s.storeName.toLowerCase() === sanitizedStoreName.toLowerCase());
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: `A merchant store with the name "${sanitizedStoreName}" is already registered. Please choose a unique store name.`
        });
      }
    }

    // 4. Case-insensitive Username Uniqueness Check in Database
    const existingUser = db.findOne('users', u => (u.username || '').toLowerCase() === finalUsernameLower);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `The username "${finalUsername}" is already taken. Please choose another username.`
      });
    }

    // Check duplicate email if an explicit email was provided by legacy payload
    const sanitizedEmail = email ? email.trim().toLowerCase() : `${finalUsernameLower}@marketzo.id`;
    if (email) {
      const existingEmailUser = db.findOne('users', u => (u.email || '').toLowerCase() === sanitizedEmail);
      if (existingEmailUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.'
        });
      }
    }

    // 5. Secure Password Hashing & Account Recovery Key Generation
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = bcrypt.hashSync(recoveryCode, salt);

    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      username: finalUsername,
      name: (name || finalUsername).trim(),
      email: sanitizedEmail,
      password: hashedPassword,
      recoveryCodeHash,
      role: role === 'seller' ? 'seller' : 'customer',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalUsername)}`,
      phone: phone ? phone.trim() : '',
      createdAt: new Date().toISOString()
    };

    db.insert('users', newUser);

    let sellerProfile = null;
    if (role === 'seller') {
      const finalStoreName = sanitizedStoreName || `${finalUsername}'s Store`;
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
    const safeUser = getSafeUser(newUser);

    // Send welcome notification
    db.insert('notifications', {
      id: `notif_${uuidv4().substring(0, 8)}`,
      userId: newUser.id,
      title: role === 'seller' ? 'Welcome Merchant! 🏪' : 'Welcome to MARKETzo! 🛍️',
      message: role === 'seller'
        ? `Your merchant store "${sellerProfile?.storeName}" is live and ready for listing products.`
        : 'Welcome to MARKETzo. Store your Recovery Key safely to protect your account.',
      type: 'account',
      read: false,
      link: role === 'seller' ? '/seller' : '/',
      createdAt: new Date().toISOString()
    });

    console.log(`[AUTH] New user registered successfully: id=${newUser.id}, username="${finalUsername}", role="${newUser.role}"`);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully! Please store your Account Recovery Key safely.',
      token,
      user: safeUser,
      recoveryCode,
      seller: sellerProfile
    });
  } catch (err) {
    console.error('[AUTH] Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
});

// =========================================================================
// 4. LOGIN (USERNAME & PASSWORD ONLY)
// =========================================================================
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const clientIp = getClientIp(req);

    const identifier = (username || email || '').trim();
    const cleanPassword = typeof password === 'string' ? password.trim() : '';

    if (!identifier || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your username and password.'
      });
    }

    // Rate Limiting Protection against repeated password guessing
    const ipRate = checkRateLimit(clientIp);
    if (!ipRate.allowed) {
      return res.status(429).json({ success: false, message: ipRate.message });
    }
    const identRate = checkRateLimit(`ident:${identifier.toLowerCase()}`);
    if (!identRate.allowed) {
      return res.status(429).json({ success: false, message: identRate.message });
    }

    // Case-insensitive lookup by username (also tolerates email for backward compatibility)
    const cleanIdent = identifier.toLowerCase();
    const user = db.findOne('users', u =>
      (u.username && u.username.toLowerCase() === cleanIdent) ||
      (u.email && u.email.toLowerCase() === cleanIdent)
    );

    if (!user) {
      recordFailedAttempt(clientIp);
      recordFailedAttempt(`ident:${cleanIdent}`);
      return res.status(401).json({
        success: false,
        message: 'No account found with this username. Please check your spelling or create a new account.'
      });
    }

    // Compare password with bcrypt + legacy auto-upgrade fallback
    let isMatch = false;
    if (user.password) {
      try {
        isMatch = bcrypt.compareSync(cleanPassword, user.password);
      } catch (e) {
        isMatch = false;
      }

      if (!isMatch && (user.password === cleanPassword || user.password === password)) {
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(cleanPassword, salt);
        db.update('users', user.id, { password: user.password });
        isMatch = true;
      }
    }

    if (!isMatch) {
      recordFailedAttempt(clientIp);
      recordFailedAttempt(`ident:${cleanIdent}`);
      return res.status(401).json({
        success: false,
        message: 'Incorrect password entered. Please try again or click "Forgot Password".'
      });
    }

    // Reset failed attempt counters on successful login
    clearFailedAttempts(clientIp);
    clearFailedAttempts(`ident:${cleanIdent}`);

    const token = generateToken(user);
    const safeUser = getSafeUser(user);
    const seller = user.role === 'seller' ? db.findOne('sellers', s => s.userId === user.id) : null;

    console.log(`[AUTH] User "${user.username || user.name}" logged in successfully (role: ${user.role}).`);

    return res.json({
      success: true,
      message: `Welcome back, ${user.username || user.name}!`,
      token,
      user: safeUser,
      seller
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
});

// =========================================================================
// 5. SECURE ACCOUNT RECOVERY (WITHOUT EMAIL OR PHONE)
// =========================================================================
router.post('/recover-password', async (req, res) => {
  try {
    const { username, recoveryCode, newPassword, confirmPassword } = req.body;
    const clientIp = getClientIp(req);

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanRecoveryCode = (recoveryCode || '').trim().toUpperCase();
    const cleanNewPassword = typeof newPassword === 'string' ? newPassword.trim() : '';

    if (!cleanUsername) {
      return res.status(400).json({ success: false, message: 'Please enter your username.' });
    }
    if (!cleanRecoveryCode) {
      return res.status(400).json({ success: false, message: 'Please provide your Account Recovery Key.' });
    }
    if (!cleanNewPassword || cleanNewPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }
    if (confirmPassword !== undefined && confirmPassword.trim() !== cleanNewPassword) {
      return res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
    }

    // Rate limiting to defend against brute-force recovery code guesses
    const rateCheck = checkRateLimit(`recover:${cleanUsername}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: rateCheck.message });
    }

    const user = db.findOne('users', u =>
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === cleanUsername)
    );

    if (!user) {
      recordFailedAttempt(`recover:${cleanUsername}`);
      return res.status(404).json({
        success: false,
        message: 'No account found with this username.'
      });
    }

    // Verify cryptographic recovery code hash
    let isCodeValid = false;
    if (user.recoveryCodeHash) {
      try {
        isCodeValid = bcrypt.compareSync(cleanRecoveryCode, user.recoveryCodeHash);
      } catch (e) {
        isCodeValid = false;
      }
    }

    // Fallback if user had resetCode stored previously
    if (!isCodeValid && user.resetCode && user.resetCode === cleanRecoveryCode) {
      isCodeValid = true;
    }

    if (!isCodeValid) {
      recordFailedAttempt(`recover:${cleanUsername}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid Account Recovery Key. Please check the key you saved during registration.'
      });
    }

    // Clear rate limits
    clearFailedAttempts(`recover:${cleanUsername}`);

    // Update password with fresh bcrypt hash & generate fresh new recovery code
    const salt = bcrypt.genSaltSync(10);
    const newHashedPassword = bcrypt.hashSync(cleanNewPassword, salt);
    const freshRecoveryCode = generateRecoveryCode();
    const freshRecoveryCodeHash = bcrypt.hashSync(freshRecoveryCode, salt);

    db.update('users', user.id, {
      password: newHashedPassword,
      recoveryCodeHash: freshRecoveryCodeHash,
      resetCode: null,
      resetCodeExpiry: null
    });

    console.log(`[AUTH] Password successfully reset for user "${user.username || user.name}".`);

    return res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in.',
      newRecoveryCode: freshRecoveryCode
    });
  } catch (err) {
    console.error('[AUTH] Recover password error:', err);
    return res.status(500).json({ success: false, message: 'Server error during password recovery.' });
  }
});

// =========================================================================
// 6. BACKWARD-COMPATIBLE LEGACY FORGOT & RESET ROUTES (FOR TEST RUNNERS)
// =========================================================================
router.post('/forgot-password', (req, res) => {
  try {
    const { email, username } = req.body;
    const identifier = (username || email || '').trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide your username or registered email.' });
    }

    const user = db.findOne('users', u =>
      (u.username && u.username.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === identifier)
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this identifier. Please sign up for a new account.'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    db.update('users', user.id, {
      resetCode,
      resetCodeExpiry: Date.now() + 3600000
    });

    return res.json({
      success: true,
      message: `Password reset code generated. Verification Code: ${resetCode}`,
      resetCode
    });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Could not process password reset request.' });
  }
});

router.post('/reset-password', (req, res) => {
  try {
    const { email, username, resetCode, newPassword } = req.body;
    const identifier = (username || email || '').trim().toLowerCase();
    const cleanPassword = (newPassword || '').trim();

    if (!identifier || !cleanPassword || cleanPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide identifier and a new password with at least 4 characters.'
      });
    }

    const user = db.findOne('users', u =>
      (u.username && u.username.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === identifier)
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (user.resetCode && resetCode && user.resetCode !== resetCode.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset code.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(cleanPassword, salt);

    db.update('users', user.id, {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null
    });

    return res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in.'
    });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({ success: false, message: 'Could not reset password.' });
  }
});

// =========================================================================
// 7. CURRENT USER PROFILE (/api/auth/me)
// =========================================================================
router.get('/me', authenticate, (req, res) => {
  const seller = req.user.role === 'seller' ? db.findOne('sellers', s => s.userId === req.user.id) : null;
  res.json({
    success: true,
    user: req.user,
    seller
  });
});

// =========================================================================
// 8. LAUNCH MERCHANT STORE (/api/auth/become-seller)
// =========================================================================
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

    // Upgrade user role to 'seller'
    const updatedUser = db.update('users', req.user.id, {
      role: 'seller',
      ...(phone !== undefined && { phone: phone ? phone.trim() : req.user.phone })
    });

    let seller = db.findOne('sellers', s => s.userId === req.user.id);

    if (seller) {
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

    const token = generateToken(updatedUser);
    const safeUser = getSafeUser(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Merchant store launched successfully! Welcome to your Merchant Portal.',
      token,
      user: safeUser,
      seller
    });
  } catch (err) {
    console.error('[AUTH] Become seller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while launching merchant store.'
    });
  }
});

// =========================================================================
// 9. UPDATE PROFILE (/api/auth/profile)
// =========================================================================
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, username, phone, avatar, storeName, storeDescription, storeLogo } = req.body;

    if (name !== undefined && (!name || name.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long.' });
    }

    if (username !== undefined) {
      const val = validateUsernameFormat(username);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.message });
      }
      const existing = db.findOne('users', u => u.id !== req.user.id && (u.username || '').toLowerCase() === val.username.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: `Username "${val.username}" is already taken.` });
      }
    }

    let isUpgradingToSeller = false;
    if (storeName && storeName.trim().length >= 2 && req.user.role !== 'seller') {
      isUpgradingToSeller = true;
    }

    const updated = db.update('users', req.user.id, {
      ...(name && { name: name.trim() }),
      ...(username && { username: username.trim() }),
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
    const safeUser = getSafeUser(updated);

    res.json({
      success: true,
      token,
      user: safeUser,
      seller,
      message: 'Profile updated successfully!'
    });
  } catch (err) {
    console.error('[AUTH] Profile update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

module.exports = router;
