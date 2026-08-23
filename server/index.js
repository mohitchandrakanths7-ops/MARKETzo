const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.get('/', (req, res) => {
  res.send('MARKETzo is live! 🚀');
});
const PORT = process.env.PORT || 5000;

// Initialize Database
const db = require('./config/database');

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for dev
app.use((req, res, next) => {
  if (!req.path.startsWith('/static')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/pincode', require('./routes/pincode'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/currency', require('./routes/currency'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/flashsales', require('./routes/flashsales'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/visualsearch', require('./routes/visualsearch'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/wholesale', require('./routes/wholesale'));

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'MARKETZO Multi-Vendor Marketplace API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      productsCount: db.findAll('products').length,
      sellersCount: db.findAll('sellers').length,
      usersCount: db.findAll('users').length,
      ordersCount: db.findAll('orders').length
    }
  });
});

// Serve frontend build in production if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// Serve frontend fallback or 404
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 MARKETZO API Server is running on http://localhost:${PORT}`);
  console.log(`🛍️ Multi-Vendor Marketplace API active and ready`);
  console.log(`=======================================================`);
});

module.exports = app;
