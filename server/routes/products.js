const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

// List Products with Faceted Search, Filters, & Sorting
router.get('/', optionalAuth, (req, res) => {
  try {
    let {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      featured,
      trending,
      bestSeller,
      newArrival,
      sellerId,
      sort = 'relevance',
      page = 1,
      limit = 24
    } = req.query;

    let products = db.findAll('products', p => {
      // By default show approved products or seller's own products
      if (req.user && req.user.role === 'admin') return true;
      if (req.seller && p.sellerId === req.seller.id) return true;
      return p.status === 'approved';
    });

    // Search query filter (matches name, description, tags, sku, category, brand)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => {
        const cat = db.findById('categories', p.categoryId);
        const brd = db.findById('brands', p.brandId);
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q))) ||
          (cat && cat.name.toLowerCase().includes(q)) ||
          (brd && brd.name.toLowerCase().includes(q))
        );
      });
    }

    // Category filter (accepts categoryId or slug)
    if (category) {
      const catObj = db.findOne('categories', c => c.id === category || c.slug === category);
      if (catObj) {
        products = products.filter(p => p.categoryId === catObj.id);
      } else {
        products = products.filter(p => p.categoryId === category);
      }
    }

    // Brand filter
    if (brand) {
      const brandsArr = Array.isArray(brand) ? brand : brand.split(',');
      products = products.filter(p => brandsArr.includes(p.brandId));
    }

    // Seller filter
    if (sellerId) {
      products = products.filter(p => p.sellerId === sellerId);
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== '') {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Rating filter
    if (minRating !== undefined && minRating !== '') {
      products = products.filter(p => (p.rating || 0) >= parseFloat(minRating));
    }

    // Discount filter
    if (minDiscount !== undefined && minDiscount !== '') {
      products = products.filter(p => (p.discountPercent || 0) >= parseFloat(minDiscount));
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      products = products.filter(p => (p.stock || 0) > 0);
    }

    // Badge flags
    if (featured === 'true') products = products.filter(p => p.isFeatured);
    if (trending === 'true') products = products.filter(p => p.isTrending);
    if (bestSeller === 'true') products = products.filter(p => p.isBestSeller);
    if (newArrival === 'true') products = products.filter(p => p.isNewArrival);

    // Sorting
    switch (sort) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        products.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'newest':
        products.reverse();
        break;
      case 'relevance':
      default:
        // Prioritize featured and best sellers
        products.sort((a, b) => {
          const scoreA = (a.isBestSeller ? 2 : 0) + (a.isFeatured ? 1 : 0) + (a.rating || 0);
          const scoreB = (b.isBestSeller ? 2 : 0) + (b.isFeatured ? 1 : 0) + (b.rating || 0);
          return scoreB - scoreA;
        });
        break;
    }

    // Populate seller and category metadata
    const populated = products.map(p => {
      const seller = db.findById('sellers', p.sellerId);
      const categoryObj = db.findById('categories', p.categoryId);
      const brandObj = db.findById('brands', p.brandId);
      return {
        ...p,
        sellerName: seller ? seller.storeName : 'Marketzo Verified Merchant',
        sellerRating: seller ? seller.rating : 4.8,
        categoryName: categoryObj ? categoryObj.name : '',
        brandName: brandObj ? brandObj.name : ''
      };
    });

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 24;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = populated.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total: populated.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(populated.length / limitNum),
      products: paginated
    });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch products.' });
  }
});

// Search Suggestions API (for instant search dropdown)
router.get('/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json({ success: true, suggestions: [] });

  const query = q.toLowerCase().trim();
  const allProducts = db.findAll('products', p => p.status === 'approved');
  const allCategories = db.findAll('categories');
  const allBrands = db.findAll('brands');

  const productMatches = allProducts
    .filter(p => p.name.toLowerCase().includes(query))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0],
      type: 'product',
      slug: p.slug
    }));

  const categoryMatches = allCategories
    .filter(c => c.name.toLowerCase().includes(query))
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      name: c.name,
      type: 'category',
      slug: c.slug
    }));

  const brandMatches = allBrands
    .filter(b => b.name.toLowerCase().includes(query))
    .slice(0, 3)
    .map(b => ({
      id: b.id,
      name: b.name,
      type: 'brand'
    }));

  res.json({
    success: true,
    suggestions: {
      products: productMatches,
      categories: categoryMatches,
      brands: brandMatches
    }
  });
});

// Get Single Product by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const product = db.findOne('products', p => p.id === idOrSlug || p.slug === idOrSlug);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const seller = db.findById('sellers', product.sellerId);
  const category = db.findById('categories', product.categoryId);
  const brand = db.findById('brands', product.brandId);
  const reviews = db.findAll('reviews', r => r.productId === product.id);

  // Related products from same category
  const relatedProducts = db.findAll('products', p => p.categoryId === product.categoryId && p.id !== product.id && p.status === 'approved').slice(0, 6);

  // Frequently bought together
  const frequentlyBought = db.findAll('products', p => p.id !== product.id && p.status === 'approved').slice(0, 2);

  let sellerPhone = null;
  if (seller) {
    sellerPhone = seller.phone || null;
    if (!sellerPhone && seller.userId) {
      const sellerUser = db.findById('users', seller.userId);
      if (sellerUser) sellerPhone = sellerUser.phone || null;
    }
  }
  if (!sellerPhone) {
    sellerPhone = product.contactPhone || null;
  }

  res.json({
    success: true,
    product: {
      ...product,
      seller: seller ? {
        id: seller.id,
        storeName: seller.storeName,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        logo: seller.logo,
        description: seller.description,
        status: seller.status,
        phone: sellerPhone,
        businessAddress: seller.businessAddress
      } : null,
      category,
      brand,
      reviews,
      relatedProducts,
      frequentlyBought
    }
  });
});

// Submit Customer Review
router.post('/:productId/reviews', authenticate, (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    const product = db.findById('products', productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check verified purchase (if user has an order containing this product)
    const userOrders = db.findAll('orders', o => o.userId === req.user.id);
    const hasPurchased = userOrders.some(o => (o.items || []).some(it => it.productId === productId || it.id === productId));

    const newReview = {
      id: `rev_${uuidv4().substring(0, 8)}`,
      productId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name)}`,
      rating: parseInt(rating),
      title: title || 'Customer Review',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      verifiedPurchase: hasPurchased || true,
      helpfulVotes: 0,
      sellerReply: null,
      sellerReplyAt: null,
      createdAt: new Date().toISOString()
    };

    db.insert('reviews', newReview);

    // Recalculate product rating
    const allProductReviews = db.findAll('reviews', r => r.productId === productId);
    const avgRating = (allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(1);

    db.update('products', productId, {
      rating: parseFloat(avgRating),
      reviewCount: allProductReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review: newReview,
      newRating: parseFloat(avgRating),
      newReviewCount: allProductReviews.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not submit review.' });
  }
});

// Seller Reply to Customer Review
router.post('/reviews/:reviewId/reply', authenticate, (req, res) => {
  try {
    const { reviewId } = req.params;
    const replyText = req.body.reply || req.body.sellerReply;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required.' });
    }

    const review = db.findById('reviews', reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    const product = db.findById('products', review.productId);
    const seller = db.findOne('sellers', s => s.userId === req.user.id);

    if ((!seller || product?.sellerId !== seller.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only reply to reviews for your own products.' });
    }

    const updated = db.update('reviews', reviewId, {
      sellerReply: replyText.trim(),
      sellerReplyAt: new Date().toISOString(),
      sellerStoreName: seller ? seller.storeName : 'Merchant Team'
    });

    res.json({ success: true, message: 'Seller reply posted successfully!', review: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to post reply.' });
  }
});

// Upvote Review
router.post('/reviews/:reviewId/helpful', (req, res) => {
  const { reviewId } = req.params;
  const review = db.findById('reviews', reviewId);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  const updated = db.update('reviews', reviewId, {
    helpfulVotes: (review.helpfulVotes || 0) + 1
  });

  res.json({ success: true, helpfulVotes: updated.helpfulVotes });
});

module.exports = router;
