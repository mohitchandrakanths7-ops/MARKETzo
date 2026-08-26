const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, requireRole('admin'));

// Platform Executive Dashboard Metrics
router.get('/metrics', (req, res) => {
  try {
    const allUsers = db.findAll('users');
    const allSellers = db.findAll('sellers');
    const allProducts = db.findAll('products');
    const allOrders = db.findAll('orders');
    const allReviews = db.findAll('reviews');

    const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
    const totalSellers = allSellers.length;
    const pendingSellers = allSellers.filter(s => s.status === 'pending').length;
    const pendingProducts = allProducts.filter(p => p.status === 'pending').length;

    const totalGMV = allOrders.reduce((sum, o) => o.orderStatus !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
    const completedOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;
    const pendingOrders = allOrders.filter(o => ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;

    // Revenue distribution by category
    const categoryRevenue = {};
    for (const order of allOrders) {
      if (order.orderStatus !== 'Cancelled') {
        for (const item of order.items) {
          const prod = db.findById('products', item.productId);
          const catId = prod ? prod.categoryId : 'other';
          categoryRevenue[catId] = (categoryRevenue[catId] || 0) + (item.price * item.quantity);
        }
      }
    }

    res.json({
      success: true,
      stats: {
        totalGMV: +totalGMV.toFixed(2),
        totalOrders: allOrders.length,
        completedOrders,
        pendingOrders,
        totalCustomers,
        totalSellers,
        pendingSellers,
        totalProducts: allProducts.length,
        pendingProducts,
        totalReviews: allReviews.length
      },
      categoryRevenue,
      recentOrders: allOrders.slice(0, 8),
      recentUsers: allUsers.slice(-6).reverse()
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch admin statistics.' });
  }
});

// Get All Sellers
router.get('/sellers', (req, res) => {
  const sellers = db.findAll('sellers');
  const populated = sellers.map(s => {
    const user = db.findById('users', s.userId);
    const productCount = db.findAll('products', p => p.sellerId === s.id).length;
    const ordersCount = db.findAll('orders', o => o.sellerIds && o.sellerIds.includes(s.id)).length;
    return {
      ...s,
      ownerName: user ? user.name : 'Unknown',
      ownerEmail: user ? user.email : '',
      ownerPhone: user ? user.phone : '',
      productCount,
      ordersCount
    };
  });
  res.json({ success: true, sellers: populated });
});

// Update Seller Status (Approve / Reject)
router.put('/sellers/:sellerId/status', (req, res) => {
  const { sellerId } = req.params;
  const { status } = req.body; // 'approved' | 'rejected' | 'suspended'

  const seller = db.findById('sellers', sellerId);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

  const updated = db.update('sellers', sellerId, { status });

  // Notify seller
  db.insert('notifications', {
    id: `notif_${uuidv4().substring(0, 8)}`,
    userId: seller.userId,
    title: `Seller Account ${status === 'approved' ? 'Approved! 🎉' : 'Status Updated'}`,
    message: `Your seller profile status is now: ${status.toUpperCase()}.`,
    type: 'seller',
    read: false,
    link: '/seller',
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, message: `Seller marked as ${status}.`, seller: updated });
});

// Moderation: Get All Products
router.get('/products', (req, res) => {
  const products = db.findAll('products');
  const populated = products.map(p => {
    const seller = db.findById('sellers', p.sellerId);
    const category = db.findById('categories', p.categoryId);
    return {
      ...p,
      sellerName: seller ? seller.storeName : 'Unknown',
      categoryName: category ? category.name : 'General'
    };
  });
  res.json({ success: true, products: populated });
});

// Update Product Moderation Status (Approve / Reject / Toggle Feature)
router.put('/products/:productId/status', (req, res) => {
  const { productId } = req.params;
  const { status, isFeatured, isTrending, isBestSeller } = req.body;

  const product = db.findById('products', productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const updated = db.update('products', productId, {
    ...(status && { status }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isTrending !== undefined && { isTrending }),
    ...(isBestSeller !== undefined && { isBestSeller })
  });

  res.json({ success: true, message: 'Product status updated.', product: updated });
});

// Coupon Management: Create
router.post('/coupons', (req, res) => {
  const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, description, expiryDate } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: 'Coupon code and value are required.' });
  }

  const newCoupon = {
    id: `cpn_${uuidv4().substring(0, 8)}`,
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    discountValue: parseFloat(discountValue),
    minOrderValue: parseFloat(minOrderValue) || 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    description: description || `Special promo: ${code}`,
    expiryDate: expiryDate || '2027-12-31T23:59:59.000Z',
    isActive: true,
    usageLimit: 5000,
    usedCount: 0
  };

  db.insert('coupons', newCoupon);
  res.status(201).json({ success: true, message: 'Coupon created successfully!', coupon: newCoupon });
});

// Coupon Management: Toggle or Delete
router.delete('/coupons/:couponId', (req, res) => {
  const { couponId } = req.params;
  db.delete('coupons', couponId);
  res.json({ success: true, message: 'Coupon deleted.' });
});

// Category Management: Add
router.post('/categories', (req, res) => {
  const { name, icon, image, description, featured = true } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    id: `cat_${uuidv4().substring(0, 8)}`,
    name,
    slug,
    icon: icon || 'Tag',
    image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80',
    description: description || 'High quality products.',
    featured: !!featured
  };

  db.insert('categories', newCat);
  res.status(201).json({ success: true, category: newCat });
});

// Banner Management: Add
router.post('/banners', (req, res) => {
  const { title, subtitle, tag, buttonText, link, image, bgGradient, badge } = req.body;
  const newBanner = {
    id: `ban_${uuidv4().substring(0, 8)}`,
    title: title || 'New Marketplace Promo',
    subtitle: subtitle || 'Limited time deals across all categories',
    tag: tag || 'PROMOTIONAL OFFER',
    buttonText: buttonText || 'Shop Now',
    link: link || '/',
    image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    bgGradient: bgGradient || 'from-indigo-900 via-slate-900 to-indigo-950',
    badge: badge || 'EXCLUSIVE',
    active: true,
    order: db.findAll('banners').length + 1
  };
  db.insert('banners', newBanner);
  res.status(201).json({ success: true, banner: newBanner });
});

// Admin Feature Requests Management
// Get all feature requests
router.get('/feature-requests', (req, res) => {
  try {
    const allRequests = db.findAll('featureRequests') || [];
    const populated = allRequests.map(r => {
      const product = db.findById('products', r.productId);
      const seller = db.findById('sellers', r.sellerId);
      const user = seller ? db.findById('users', seller.userId) : null;
      return {
        ...r,
        productName: product ? product.name : r.productName,
        productImage: product?.images?.[0] || product?.image || r.productImage,
        productPrice: product ? product.price : 0,
        productOriginalPrice: product ? product.originalPrice : 0,
        productStock: product ? product.stock : 0,
        productRating: product ? product.rating : 5.0,
        productStatus: product ? product.status : 'unknown',
        isProductPublished: product ? product.status === 'approved' : false,
        isProductActive: product ? product.stock > 0 : false,
        sellerStoreName: seller ? seller.storeName : (r.sellerStoreName || 'Unknown Store'),
        sellerEmail: user ? user.email : '',
        sellerPhone: seller?.phone || user?.phone || ''
      };
    });

    // Sort by requestedAt descending
    populated.sort((a, b) => new Date(b.requestedAt || b.createdAt || 0) - new Date(a.requestedAt || a.createdAt || 0));

    res.json({ success: true, requests: populated });
  } catch (err) {
    console.error('Error fetching admin feature requests:', err);
    res.status(500).json({ success: false, message: 'Could not fetch feature requests.' });
  }
});

// Approve or Reject Feature Request
router.put('/feature-requests/:requestId/status', (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, priority, homePageSection, featuredUntil, rejectionReason } = req.body;

    const request = db.findById('featureRequests', requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Feature request not found.' });
    }

    if (!['approved', 'rejected', 'pending', 'removed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const finalPriority = priority !== undefined ? parseInt(priority) : (request.priority || 1);
    const finalSection = homePageSection || request.homePageSection || 'Featured Products';
    const finalExpiry = featuredUntil || request.featuredUntil;

    const updated = db.update('featureRequests', requestId, {
      status,
      priority: finalPriority,
      homePageSection: finalSection,
      featuredUntil: finalExpiry,
      rejectionReason: status === 'rejected' ? (rejectionReason || 'Does not meet current promotional curation standards.') : null,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update product's featured flags
    const isApproved = status === 'approved';
    const product = db.findById('products', request.productId);
    if (product) {
      db.update('products', product.id, {
        isFeatured: isApproved,
        featureSection: isApproved ? finalSection : null,
        featurePriority: isApproved ? finalPriority : 0,
        featuredUntil: isApproved ? finalExpiry : null
      });
    }

    // Send notification to seller
    const seller = db.findById('sellers', request.sellerId);
    if (seller && seller.userId) {
      db.insert('notifications', {
        id: `notif_${uuidv4().substring(0, 8)}`,
        userId: seller.userId,
        title: status === 'approved' 
          ? '🎉 Product Featured on Marketzo Home Page!' 
          : status === 'rejected' 
            ? '❌ Feature Request Update' 
            : 'Feature Request Updated',
        message: status === 'approved'
          ? `Great news! "${request.productName}" is now featured on the Marketzo Home Page in "${finalSection}".`
          : status === 'rejected'
            ? `Your feature request for "${request.productName}" was declined: ${rejectionReason || 'Promotional space full'}. You may submit another request.`
            : `Feature status updated for "${request.productName}".`,
        type: 'feature_request',
        read: false,
        link: '/seller',
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: status === 'approved' 
        ? 'Feature request approved! Product is now live on the Home Page.' 
        : status === 'rejected'
          ? 'Feature request rejected.'
          : 'Feature request updated.',
      request: updated
    });
  } catch (err) {
    console.error('Error updating feature request:', err);
    res.status(500).json({ success: false, message: 'Could not update feature request.' });
  }
});

// Remove product from Home Page
router.delete('/feature-requests/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const request = db.findById('featureRequests', requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Feature request not found.' });
    }

    // Update status to removed / unfeatured
    db.update('featureRequests', requestId, {
      status: 'removed',
      updatedAt: new Date().toISOString()
    });

    // Remove featured flag from product
    const product = db.findById('products', request.productId);
    if (product) {
      db.update('products', product.id, {
        isFeatured: false,
        featureSection: null,
        featurePriority: 0,
        featuredUntil: null
      });
    }

    // Notify seller
    const seller = db.findById('sellers', request.sellerId);
    if (seller && seller.userId) {
      db.insert('notifications', {
        id: `notif_${uuidv4().substring(0, 8)}`,
        userId: seller.userId,
        title: 'Home Page Feature Concluded',
        message: `The home page feature campaign for "${request.productName}" has been concluded.`,
        type: 'feature_request',
        read: false,
        link: '/seller',
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Product removed from Marketzo Home Page.' });
  } catch (err) {
    console.error('Error removing feature request:', err);
    res.status(500).json({ success: false, message: 'Could not remove product from Home Page.' });
  }
});

module.exports = router;
