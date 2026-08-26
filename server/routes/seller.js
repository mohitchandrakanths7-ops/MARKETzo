const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Middleware to ensure user is a seller
router.use(authenticate, requireRole('seller', 'admin'));

// Seller Dashboard Analytics Overview
router.get('/metrics', (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller account profile not found.' });
    }

    const sellerProducts = db.findAll('products', p => p.sellerId === seller.id);
    const sellerOrders = db.findAll('orders', o => o.sellerIds && o.sellerIds.includes(seller.id));

    // Calculate revenue for this seller
    let totalRevenue = 0;
    let pendingOrdersCount = 0;
    let shippedOrdersCount = 0;
    let deliveredOrdersCount = 0;

    for (const order of sellerOrders) {
      if (order.orderStatus !== 'Cancelled') {
        const vendorItems = order.items.filter(i => i.sellerId === seller.id);
        const orderRev = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalRevenue += orderRev;
      }

      if (['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus)) {
        pendingOrdersCount++;
      } else if (['Shipped', 'Out for Delivery'].includes(order.orderStatus)) {
        shippedOrdersCount++;
      } else if (order.orderStatus === 'Delivered') {
        deliveredOrdersCount++;
      }
    }

    const lowStockProducts = sellerProducts.filter(p => (p.stock || 0) <= 5);

    // Sales by day (simulated for chart)
    const monthlySales = [
      { month: 'Mar', sales: 4200 },
      { month: 'Apr', sales: 6800 },
      { month: 'May', sales: 9400 },
      { month: 'Jun', sales: 12100 },
      { month: 'Jul', sales: 15300 },
      { month: 'Aug', sales: totalRevenue > 0 ? totalRevenue : 18900 }
    ];

    res.json({
      success: true,
      seller,
      metrics: {
        totalRevenue: +totalRevenue.toFixed(2),
        totalOrders: sellerOrders.length,
        pendingOrders: pendingOrdersCount,
        shippedOrders: shippedOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        totalProducts: sellerProducts.length,
        lowStockCount: lowStockProducts.length,
        averageRating: seller.rating || 4.9,
        monthlySales
      },
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentOrders: sellerOrders.slice(0, 5)
    });
  } catch (err) {
    console.error('Seller metrics error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch seller analytics.' });
  }
});

// Seller Product Catalog
router.get('/products', (req, res) => {
  const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

  const products = db.findAll('products', p => p.sellerId === seller.id);
  const populated = products.map(p => {
    const category = db.findById('categories', p.categoryId);
    const brand = db.findById('brands', p.brandId);
    return {
      ...p,
      categoryName: category ? category.name : 'General',
      brandName: brand ? brand.name : 'Custom'
    };
  });

  res.json({ success: true, products: populated });
});

// Add New Product
router.post('/products', (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

    const {
      name,
      categoryId,
      brandId = null,
      description,
      price,
      originalPrice,
      stock = 10,
      sku,
      weight,
      shippingInfo,
      contactPhone,
      tags = [],
      status = 'approved', // 'approved' (Published) | 'draft'
      images = [],
      variants = [],
      specs = {},
      highlights = [],
      offers = [],
      category
    } = req.body;

    const finalCategoryId = categoryId || category || 'cat_01';

    if (!name || !finalCategoryId || price === undefined || price === '') {
      return res.status(400).json({ success: false, message: 'Product Name, Department Category, and Price are required.' });
    }

    const priceNum = parseFloat(price);
    const origPriceNum = originalPrice ? parseFloat(originalPrice) : priceNum;
    const discountPercent = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const defaultImg = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];

    const newProduct = {
      id: `prod_${uuidv4().substring(0, 8)}`,
      sellerId: seller.id,
      categoryId: finalCategoryId,
      brandId: brandId || 'br_custom',
      name: name.trim(),
      slug,
      description: description ? description.trim() : 'High quality verified marketplace product with manufacturer warranty.',
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent,
      stock: parseInt(stock) || 0,
      sku: sku ? sku.trim() : `MKZ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      weight: weight ? weight.trim() : '0.5 kg',
      shippingInfo: shippingInfo ? shippingInfo.trim() : 'Free Express 2-Day Shipping',
      contactPhone: contactPhone ? contactPhone.trim() : (seller.phone || null),
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      rating: 5.0,
      reviewCount: 0,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      isNewArrival: true,
      status: status || 'approved',
      images: defaultImg,
      variants: Array.isArray(variants) ? variants : [],
      specs: specs && Object.keys(specs).length > 0 ? specs : { 'Warranty': '1 Year Standard', 'Condition': 'Brand New' },
      highlights: highlights && highlights.length > 0 ? highlights : ['Genuine authenticated stock', 'Fast Marketzo dispatch'],
      offers: offers && offers.length > 0 ? offers : ['Special introductory promotional discount'],
      createdAt: new Date().toISOString()
    };

    db.insert('products', newProduct);

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Product saved as Draft.' : 'Product published successfully to the Marketplace!',
      product: newProduct
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Could not create product.' });
  }
});

// Update Product
router.put('/products/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    const product = db.findById('products', productId);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (product.sellerId !== seller.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not own this product.' });
    }

    const {
      name,
      categoryId,
      brandId,
      description,
      price,
      originalPrice,
      stock,
      sku,
      weight,
      shippingInfo,
      contactPhone,
      tags,
      status,
      images,
      variants,
      specs,
      highlights,
      offers
    } = req.body;

    const priceNum = price !== undefined ? parseFloat(price) : product.price;
    const origPriceNum = originalPrice !== undefined ? parseFloat(originalPrice) : product.originalPrice;
    const discountPercent = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const updated = db.update('products', productId, {
      ...(name && { name: name.trim() }),
      ...(categoryId && { categoryId }),
      ...(brandId !== undefined && { brandId }),
      ...(description !== undefined && { description }),
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent,
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(sku !== undefined && { sku: sku.trim() }),
      ...(weight !== undefined && { weight }),
      ...(shippingInfo !== undefined && { shippingInfo }),
      ...(contactPhone !== undefined && { contactPhone }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()) }),
      ...(status !== undefined && { status }),
      ...(images && { images }),
      ...(variants !== undefined && { variants }),
      ...(specs !== undefined && { specs }),
      ...(highlights !== undefined && { highlights }),
      ...(offers !== undefined && { offers }),
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Product updated successfully!', product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// Delete Product
router.delete('/products/:productId', (req, res) => {
  const { productId } = req.params;
  const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
  const product = db.findById('products', productId);

  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  if (product.sellerId !== seller.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
  }

  db.delete('products', productId);
  res.json({ success: true, message: 'Product deleted successfully.' });
});

// Seller Orders
router.get('/orders', (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

    const allMatchingOrders = db.findAll('orders', o => {
      if (!o) return false;
      const matchSellerIds = Array.isArray(o.sellerIds) && o.sellerIds.includes(seller.id);
      const matchItems = Array.isArray(o.items) && o.items.some(it => it && it.sellerId === seller.id);
      return matchSellerIds || matchItems;
    });

    allMatchingOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Scoped to seller's own catalog items
    const scopedOrders = allMatchingOrders.map(order => {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      const sellerItems = orderItems.filter(item => item && (item.sellerId === seller.id || !item.sellerId));
      const sellerSubtotal = sellerItems.reduce((acc, it) => acc + ((parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1)), 0);
      const user = order.userId ? db.findById('users', order.userId) : null;
      const shippingAddress = (order.shippingAddress && typeof order.shippingAddress === 'object') ? order.shippingAddress : {};

      return {
        ...order,
        customerName: order.customerName || order.userName || user?.name || shippingAddress.fullName || 'Valued Customer',
        customerEmail: order.customerEmail || order.userEmail || user?.email || 'N/A',
        customerPhone: order.customerPhone || shippingAddress.phone || user?.phone || 'N/A',
        items: sellerItems.length > 0 ? sellerItems : orderItems,
        sellerItemsTotal: +sellerSubtotal.toFixed(2),
        isMultiSellerOrder: Array.isArray(order.sellerIds) && order.sellerIds.length > 1
      };
    });

    res.json({ success: true, orders: scopedOrders });
  } catch (err) {
    console.error('Error fetching seller orders:', err);
    res.status(500).json({ success: false, message: 'Could not retrieve orders.' });
  }
});

// Update Store Profile
router.put('/profile', (req, res) => {
  const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

  const { storeName, description, logo, banner, businessAddress, payoutBank, phone } = req.body;
  const updated = db.update('sellers', seller.id, {
    ...(storeName && { storeName }),
    ...(description && { description }),
    ...(logo && { logo }),
    ...(banner && { banner }),
    ...(businessAddress && { businessAddress }),
    ...(payoutBank && { payoutBank }),
    ...(phone !== undefined && { phone })
  });

  // Also sync user phone if provided
  if (phone && seller.userId) {
    db.update('users', seller.userId, { phone });
  }

  res.json({ success: true, message: 'Store profile updated!', seller: updated });
});

// Submit / Request Product Feature on Home Page
router.post('/feature-requests', (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

    const { productId, homePageSection = 'Featured Products', priority = 1, featuredUntil } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = db.findById('products', productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.sellerId !== seller.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only request feature for your own products.' });
    }

    if (product.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only published products can be featured on the Home Page.' });
    }

    // Default expiry: 30 days from now if not provided
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const finalExpiry = featuredUntil || defaultExpiry;

    // Check if an existing request exists for this product
    const existingReq = db.findOne('featureRequests', r => r.productId === productId);

    let featureReq;
    if (existingReq) {
      featureReq = db.update('featureRequests', existingReq.id, {
        sellerId: seller.id,
        sellerStoreName: seller.storeName,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || product.image || '',
        homePageSection: homePageSection || 'Featured Products',
        priority: parseInt(priority) || 1,
        featuredUntil: finalExpiry,
        status: 'pending',
        rejectionReason: null,
        requestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      featureReq = {
        id: `freq_${uuidv4().substring(0, 8)}`,
        sellerId: seller.id,
        sellerStoreName: seller.storeName,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || product.image || '',
        homePageSection: homePageSection || 'Featured Products',
        priority: parseInt(priority) || 1,
        featuredUntil: finalExpiry,
        status: 'pending',
        rejectionReason: null,
        requestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.insert('featureRequests', featureReq);
    }

    res.status(201).json({
      success: true,
      message: 'Feature request submitted successfully. Waiting for admin approval.',
      request: featureReq
    });
  } catch (err) {
    console.error('Submit feature request error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit feature request.' });
  }
});

// Get Feature Requests for Seller
router.get('/feature-requests', (req, res) => {
  try {
    const seller = req.seller || db.findOne('sellers', s => s.userId === req.user.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found.' });

    const requests = db.findAll('featureRequests', r => r.sellerId === seller.id);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Fetch seller feature requests error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch feature requests.' });
  }
});

module.exports = router;
