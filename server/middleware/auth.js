const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'marketzo-secret-jwt-key-2026-production';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session is invalid or user no longer exists.' });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    
    // Attach seller profile if user is a seller
    if (user.role === 'seller') {
      const seller = db.findOne('sellers', s => s.userId === user.id);
      req.seller = seller;
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or has expired.' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findById('users', decoded.id);
    if (user) {
      const { password, ...safeUser } = user;
      req.user = safeUser;
      if (user.role === 'seller') {
        req.seller = db.findOne('sellers', s => s.userId === user.id);
      }
    }
  } catch (e) {
    req.user = null;
  }
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = {
  JWT_SECRET,
  authenticate,
  optionalAuth,
  requireRole
};
