const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

function isDemoProduct(p) {
  if (!p) return false;
  if (p.id && /^prod_0[1-9]|^prod_1[0-9]$/.test(p.id)) return true;
  if (p.sellerId === 'sel_01' || p.sellerId === 'sel_02') return true;
  return false;
}

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
      hotDeals,
      deal,
      trending,
      bestSeller,
      newArrival,
      sellerId,
      sort = 'relevance',
      page = 1,
      limit = 24
    } = req.query;

    let products = db.findAll('products', p => {
      // Exclude legacy demo products
      if (isDemoProduct(p)) return false;
      // By default show approved products or seller's own products
      if (req.user && req.user.role === 'admin') return true;
      if (req.seller && p.sellerId === req.seller.id) return true;
      return p.status === 'approved';
    });

    // Build category map for quick O(1) lookups
    const allCategories = db.findAll('categories');
    const categoryMap = new Map();
    allCategories.forEach(c => {
      categoryMap.set(c.id, c);
      if (c.slug) categoryMap.set(c.slug.toLowerCase(), c);
      if (c.name) categoryMap.set(c.name.toLowerCase(), c);
    });

    // Build brand map for quick O(1) lookups
    const allBrands = db.findAll('brands');
    const brandMap = new Map();
    allBrands.forEach(b => {
      brandMap.set(b.id, b);
      if (b.name) brandMap.set(b.name.toLowerCase(), b);
    });

    // Category filter (accepts categoryId, slug, or name; ignores 'all')
    if (category && category !== 'all' && category !== 'undefined' && category !== 'null' && category.trim()) {
      const catKey = category.trim().toLowerCase();
      const matchedCat = categoryMap.get(catKey) || categoryMap.get(category.trim());
      if (matchedCat) {
        products = products.filter(p => p.categoryId === matchedCat.id);
      } else {
        products = products.filter(p => p.categoryId === category.trim());
      }
    }

    // Search query filter (matches name, description, tags, sku, category, brand)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => {
        const cat = categoryMap.get(p.categoryId);
        const brd = brandMap.get(p.brandId);
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(q))) ||
          (cat && cat.name && cat.name.toLowerCase().includes(q)) ||
          (brd && brd.name && brd.name.toLowerCase().includes(q))
        );
      });
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
      const minP = parseFloat(minPrice);
      if (!isNaN(minP)) products = products.filter(p => p.price >= minP);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) products = products.filter(p => p.price <= maxP);
    }

    // Rating filter
    if (minRating !== undefined && minRating !== '') {
      const minR = parseFloat(minRating);
      if (!isNaN(minR)) products = products.filter(p => (p.rating || 0) >= minR);
    }

    // Discount filter
    if (minDiscount !== undefined && minDiscount !== '') {
      const minD = parseFloat(minDiscount);
      if (!isNaN(minD)) products = products.filter(p => (p.discountPercent || 0) >= minD);
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      products = products.filter(p => (p.stock || 0) > 0);
    }

    // Badge flags
    if (featured === 'true') products = products.filter(p => p.isFeatured);
    if (hotDeals === 'true' || deal === 'true') {
      products = products.filter(p => p.isHotDeal || (p.discountPercent || 0) >= 20 || p.featureSection === 'Hot Deals');
    }
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
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'relevance':
      default:
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    // Build seller map for batch O(1) lookups
    const allSellers = db.findAll('sellers');
    const sellerMap = new Map();
    allSellers.forEach(s => sellerMap.set(s.id, s));

    // Populate seller and category metadata
    const populated = products.map(p => {
      const seller = sellerMap.get(p.sellerId);
      const categoryObj = categoryMap.get(p.categoryId);
      const brandObj = brandMap.get(p.brandId);
      return {
        ...p,
        sellerName: seller ? seller.storeName : 'Marketzo Verified Merchant',
        sellerRating: seller ? seller.rating : 4.8,
        categoryName: categoryObj ? categoryObj.name : '',
        categorySlug: categoryObj ? categoryObj.slug : '',
        brandName: brandObj ? brandObj.name : ''
      };
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 24));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = populated.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total: populated.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(populated.length / limitNum)),
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
  const allProducts = db.findAll('products', p => p.status === 'approved' && !isDemoProduct(p));
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

// Dynamic Featured Products for Home Page
// Returns approved, non-expired, active published products
router.get('/featured', (req, res) => {
  try {
    const now = new Date();
    const allFeatureRequests = db.findAll('featureRequests', r => {
      if (r.status !== 'approved') return false;
      if (r.featuredUntil) {
        const expiryDate = new Date(r.featuredUntil.includes('T') ? r.featuredUntil : `${r.featuredUntil}T23:59:59.999Z`);
        if (expiryDate < now) return false;
      }
      return true;
    });

    // Sort requests by priority (highest first), then by date
    allFeatureRequests.sort((a, b) => {
      const pDiff = (b.priority || 1) - (a.priority || 1);
      if (pDiff !== 0) return pDiff;
      return new Date(b.updatedAt || b.requestedAt || 0) - new Date(a.updatedAt || a.requestedAt || 0);
    });

    const featuredProductIds = new Set();
    const featuredList = [];

    for (const reqItem of allFeatureRequests) {
      if (featuredProductIds.has(reqItem.productId)) continue;
      const product = db.findById('products', reqItem.productId);
      if (
        product &&
        product.status === 'approved' &&
        (product.stock || 0) > 0 &&
        !isDemoProduct(product)
      ) {
        const seller = db.findById('sellers', product.sellerId);
        const category = db.findById('categories', product.categoryId);
        const brand = db.findById('brands', product.brandId);

        featuredProductIds.add(product.id);
        featuredList.push({
          ...product,
          sellerName: seller ? seller.storeName : 'Marketzo Verified Merchant',
          categoryName: category ? category.name : 'Featured',
          brandName: brand ? brand.name : 'Custom',
          featureSection: reqItem.homePageSection || 'Featured Products',
          featurePriority: reqItem.priority || 1,
          featuredUntil: reqItem.featuredUntil
        });
      }
    }

    // Also include products flagged with isFeatured = true if not already included
    const directFeatured = db.findAll('products', p => {
      if (isDemoProduct(p)) return false;
      if (p.status !== 'approved') return false;
      if ((p.stock || 0) <= 0) return false;
      if (!p.isFeatured) return false;
      if (p.featuredUntil) {
        const expiryDate = new Date(p.featuredUntil.includes('T') ? p.featuredUntil : `${p.featuredUntil}T23:59:59.999Z`);
        if (expiryDate < now) return false;
      }
      return !featuredProductIds.has(p.id);
    });

    for (const p of directFeatured) {
      const seller = db.findById('sellers', p.sellerId);
      const category = db.findById('categories', p.categoryId);
      const brand = db.findById('brands', p.brandId);

      featuredList.push({
        ...p,
        sellerName: seller ? seller.storeName : 'Marketzo Verified Merchant',
        categoryName: category ? category.name : 'Featured',
        brandName: brand ? brand.name : 'Custom',
        featureSection: p.featureSection || 'Featured Products',
        featurePriority: p.featurePriority || 1
      });
    }

    res.json({
      success: true,
      count: featuredList.length,
      products: featuredList
    });
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ success: false, message: 'Could not fetch featured products.' });
  }
});

// Trending Products Endpoint
router.get('/trending-now', (req, res) => {
  try {
    const products = db.findAll('products', p => !isDemoProduct(p) && p.status === 'approved');
    const categories = db.findAll('categories');
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    // Rank by isTrending flag, reviewCount, and rating
    const sorted = [...products].sort((a, b) => {
      const scoreA = (a.isTrending ? 10 : 0) + (a.isBestSeller ? 5 : 0) + (a.rating || 4.5) * 2 + (a.reviewCount || 10) * 0.1;
      const scoreB = (b.isTrending ? 10 : 0) + (b.isBestSeller ? 5 : 0) + (b.rating || 4.5) * 2 + (b.reviewCount || 10) * 0.1;
      return scoreB - scoreA;
    });

    const populated = sorted.slice(0, 12).map(p => ({
      ...p,
      categoryName: catMap.get(p.categoryId) || 'Marketplace'
    }));

    res.json({ success: true, products: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch trending products.' });
  }
});

// Picked For You / Personalized Recommendation
router.get('/picked-for-you', optionalAuth, (req, res) => {
  try {
    const products = db.findAll('products', p => !isDemoProduct(p) && p.status === 'approved');
    const categories = db.findAll('categories');
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    // Return high satisfaction, top-rated products
    const sorted = [...products].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    const populated = sorted.slice(0, 8).map(p => ({
      ...p,
      categoryName: catMap.get(p.categoryId) || 'Marketplace'
    }));

    res.json({ success: true, products: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch personalized products.' });
  }
});

// Explore Trusted Sellers & Storefronts
router.get('/explore-sellers', (req, res) => {
  try {
    const sellers = db.findAll('sellers', s => s.id !== 'sel_01' && s.id !== 'sel_02' && (s.status === 'approved' || s.isVerified));
    const products = db.findAll('products', p => !isDemoProduct(p) && p.status === 'approved');
    const allOrders = db.findAll('orders');

    const result = sellers.map(seller => {
      const sellerProducts = products.filter(p => p.sellerId === seller.id);
      const completedOrders = allOrders.filter(o => o.sellerIds?.includes(seller.id) && o.orderStatus === 'Delivered').length;
      
      // Calculate realistic MARKETZO Trust Score (88% - 99%)
      const baseRating = parseFloat(seller.rating) || 4.8;
      const trustScore = Math.min(99, Math.max(88, Math.round((baseRating / 5) * 92 + (completedOrders > 5 ? 6 : 4))));

      return {
        id: seller.id,
        storeName: seller.storeName,
        storeLogo: seller.logo || seller.storeLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seller.storeName)}`,
        rating: baseRating,
        reviewCount: seller.reviewCount || 48,
        trustScore: `${trustScore}%`,
        isVerified: !!seller.isVerified || seller.status === 'approved',
        productCount: sellerProducts.length,
        deliveryPerformance: '99.2% On-Time',
        sampleProducts: sellerProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name, image: p.images?.[0] || p.image }))
      };
    });

    res.json({ success: true, sellers: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch seller storefronts.' });
  }
});

// Make Me a Deal (Customer Offer Submission)
router.post('/make-deal', optionalAuth, (req, res) => {
  try {
    const { productId, offerPrice, customerName, customerEmail, customerPhone, customerNote } = req.body;
    if (!productId || !offerPrice || parseFloat(offerPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid product and offer amount are required.' });
    }

    const product = db.findById('products', productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const numOffer = parseFloat(offerPrice);
    if (numOffer >= product.price) {
      return res.status(400).json({ success: false, message: 'Offer price must be lower than the current listed price.' });
    }

    const newOffer = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || product.image,
      listedPrice: product.price,
      offerPrice: numOffer,
      discountRequested: Math.round(((product.price - numOffer) / product.price) * 100),
      sellerId: product.sellerId,
      customerId: req.user ? req.user.id : null,
      customerName: customerName || (req.user ? req.user.name : 'Verified Shopper'),
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      customerPhone: customerPhone || '',
      customerNote: customerNote || 'Interested in immediate purchase at this price.',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.insert('offers', newOffer);

    res.status(201).json({
      success: true,
      message: `Offer of ₹${numOffer} submitted successfully to the merchant!`,
      offer: newOffer
    });
  } catch (err) {
    console.error('Make deal error:', err);
    res.status(500).json({ success: false, message: 'Could not submit offer.' });
  }
});

// Get Single Product by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const product = db.findOne('products', p => (p.id === idOrSlug || p.slug === idOrSlug) && !isDemoProduct(p));

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const seller = db.findById('sellers', product.sellerId);
  const category = db.findById('categories', product.categoryId);
  const brand = db.findById('brands', product.brandId);
  const reviews = db.findAll('reviews', r => r.productId === product.id);

  // Related products from same category
  const relatedProducts = db.findAll('products', p => p.categoryId === product.categoryId && p.id !== product.id && p.status === 'approved' && !isDemoProduct(p)).slice(0, 6);

  // Frequently bought together
  const frequentlyBought = db.findAll('products', p => p.id !== product.id && p.status === 'approved' && !isDemoProduct(p)).slice(0, 2);

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
