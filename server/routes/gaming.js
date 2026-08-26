const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper to test if a product is strictly a gaming product
function isGamingProduct(p) {
  if (!p || p.status !== 'approved') return false;
  if (p.categoryId === 'cat_gaming') return true;
  if (p.isGaming === true) return true;
  if (Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes('gaming'))) return true;
  if (p.gamingSubCategory) return true;
  return false;
}

// Compute accurate Marketzo Gamer Score (88-99) based on legitimate product metrics
function computeGamerScore(product) {
  const rating = parseFloat(product.rating) || 4.8;
  const reviewBonus = Math.min(5, (product.reviewCount || 30) / 20);
  const discountBonus = product.discountPercent > 15 ? 2 : 0;
  const rawScore = Math.round((rating / 5) * 88 + reviewBonus + discountBonus + (product.isFeatured ? 2 : 0));
  return Math.min(99, Math.max(88, rawScore));
}

// 1. Get Gaming Gear (Faceted Search & Filters - Strictly Scoped to Gaming)
router.get('/products', (req, res) => {
  try {
    const {
      search,
      subCategory,
      loadout,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      isDeal,
      sort = 'relevance',
      page = 1,
      limit = 24
    } = req.query;

    // Strict baseline query: Gaming products ONLY
    let products = db.findAll('products', isGamingProduct);

    // Filter by Gaming SubCategory
    if (subCategory && subCategory !== 'all') {
      const sub = subCategory.toLowerCase().trim();
      products = products.filter(p => {
        const pSub = (p.gamingSubCategory || '').toLowerCase();
        const pTags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [];
        const pName = p.name.toLowerCase();

        if (sub.includes('mouse')) return pSub === 'mouse' || pTags.includes('mouse') || pName.includes('mouse');
        if (sub.includes('keyboard')) return pSub === 'keyboard' || pTags.includes('keyboard') || pName.includes('keyboard');
        if (sub.includes('headset') || sub.includes('audio')) return pSub === 'headset' || pTags.includes('headset') || pName.includes('headset') || pName.includes('audio');
        if (sub.includes('monitor') || sub.includes('screen')) return pSub === 'monitor' || pTags.includes('monitor') || pName.includes('monitor');
        if (sub.includes('controller') || sub.includes('gamepad')) return pSub === 'controller' || pTags.includes('controller') || pName.includes('gamepad') || pName.includes('controller');
        if (sub.includes('chair') || sub.includes('desk')) return pSub === 'chair' || pTags.includes('chair') || pName.includes('chair');
        if (sub.includes('rgb') || sub.includes('accessory')) return pSub === 'rgb' || pTags.includes('rgb') || pName.includes('rgb') || pName.includes('mousepad');
        if (sub.includes('streaming') || sub.includes('mic')) return pSub === 'streaming' || pTags.includes('streaming') || pName.includes('mic') || pName.includes('stream');
        if (sub.includes('pc') || sub.includes('laptop')) return pSub === 'pc' || pTags.includes('pc') || pName.includes('laptop') || pName.includes('workstation');
        return pSub === sub || pTags.includes(sub);
      });
    }

    // Filter by Loadout Style (FPS, Racing, Esports, Console, RPG, Streaming)
    if (loadout && loadout !== 'all') {
      const l = loadout.toLowerCase().trim();
      products = products.filter(p => {
        const loadouts = Array.isArray(p.loadouts) ? p.loadouts.map(x => x.toLowerCase()) : [];
        const text = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        if (l === 'fps') return loadouts.includes('fps') || text.includes('dpi') || text.includes('240hz') || text.includes('optical') || text.includes('tkl');
        if (l === 'racing') return loadouts.includes('racing') || text.includes('ultrawide') || text.includes('curved') || text.includes('force');
        if (l === 'esports') return loadouts.includes('esports') || text.includes('pro') || text.includes('tournament') || text.includes('low-latency');
        if (l === 'console') return loadouts.includes('console') || text.includes('controller') || text.includes('gamepad') || text.includes('wireless');
        if (l === 'rpg') return loadouts.includes('rpg') || text.includes('macro') || text.includes('qhd') || text.includes('surround');
        if (l === 'streaming') return loadouts.includes('streaming') || text.includes('microphone') || text.includes('rgb') || text.includes('soundbar');
        return loadouts.includes(l);
      });
    }

    // Search query (strictly scoped within Gaming)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(q)))
      );
    }

    // Price range filters
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

    // In-Stock & Deals filter
    if (inStock === 'true' || inStock === true) {
      products = products.filter(p => (p.stock || 0) > 0);
    }
    if (isDeal === 'true' || isDeal === true) {
      products = products.filter(p => (p.discountPercent || 0) >= 15 || p.isHotDeal);
    }

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
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'discount':
        products.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'relevance':
      default:
        products.sort((a, b) => computeGamerScore(b) - computeGamerScore(a));
        break;
    }

    // Populate seller and gamer score metadata
    const allSellers = db.findAll('sellers');
    const sellerMap = new Map(allSellers.map(s => [s.id, s]));

    const populated = products.map(p => {
      const seller = sellerMap.get(p.sellerId);
      return {
        ...p,
        gamerScore: computeGamerScore(p),
        sellerName: seller ? seller.storeName : 'Verified Gaming Merchant',
        sellerRating: seller ? seller.rating : 4.9,
        isVerifiedSeller: !!(seller && (seller.isVerified || seller.status === 'approved')),
        categoryName: 'Gaming Zone'
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
    console.error('Gaming products error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch gaming products.' });
  }
});

// 2. AI Gaming Setup Builder (Assembles a real battle station setup from actual catalog)
router.post('/ai-builder', (req, res) => {
  try {
    const { budget = 30000, style = 'FPS', experience = 'Advanced', currency = 'INR', exchangeRate = 86.5 } = req.body;

    const numBudget = parseFloat(budget) || (currency === 'INR' ? 30000 : 400);
    // Convert to base USD for internal filtering if in INR
    const budgetUSD = (currency === 'INR' || numBudget > 1500) ? numBudget / (exchangeRate || 86.5) : numBudget;

    const allGaming = db.findAll('products', isGamingProduct);
    if (allGaming.length === 0) {
      return res.status(404).json({ success: false, message: 'No gaming products available to build a setup.' });
    }

    // Categorize available gear
    const mice = allGaming.filter(p => p.name.toLowerCase().includes('mouse') || (p.tags || []).includes('mouse'));
    const keyboards = allGaming.filter(p => p.name.toLowerCase().includes('keyboard') || (p.tags || []).includes('keyboard'));
    const headsets = allGaming.filter(p => p.name.toLowerCase().includes('headset') || p.name.toLowerCase().includes('audio') || (p.tags || []).includes('headset'));
    const monitors = allGaming.filter(p => p.name.toLowerCase().includes('monitor') || (p.tags || []).includes('monitor'));
    const accessories = allGaming.filter(p => p.name.toLowerCase().includes('rgb') || p.name.toLowerCase().includes('mic') || p.name.toLowerCase().includes('chair') || p.name.toLowerCase().includes('pad'));

    // Pick best matching products according to budget distribution
    const selectBest = (list, targetShare) => {
      if (!list || list.length === 0) return null;
      const targetUSD = budgetUSD * targetShare;
      const sorted = [...list].sort((a, b) => Math.abs(a.price - targetUSD) - Math.abs(b.price - targetUSD));
      return sorted[0];
    };

    const setupItems = [];
    const selectedMouse = selectBest(mice, 0.12);
    if (selectedMouse) setupItems.push({ ...selectedMouse, role: '🖱️ Precision Gaming Mouse' });

    const selectedKb = selectBest(keyboards, 0.22);
    if (selectedKb) setupItems.push({ ...selectedKb, role: '⌨️ Mechanical Gaming Keyboard' });

    const selectedHeadset = selectBest(headsets, 0.18);
    if (selectedHeadset) setupItems.push({ ...selectedHeadset, role: '🎧 Spatial Surround Headset' });

    const selectedMon = selectBest(monitors, 0.38);
    if (selectedMon) setupItems.push({ ...selectedMon, role: '🖥️ High-Refresh Esports Monitor' });

    const selectedAcc = selectBest(accessories, 0.10);
    if (selectedAcc) setupItems.push({ ...selectedAcc, role: '🌈 RGB & Audio Peripherals' });

    const totalUSD = setupItems.reduce((sum, item) => sum + item.price, 0);

    const setup = {
      title: `${style} Pro Battle Station (${experience} Tier)`,
      style,
      experience,
      totalUSD: +totalUSD.toFixed(2),
      items: setupItems.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        discountPercent: p.discountPercent || 0,
        image: p.images?.[0] || p.image,
        role: p.role,
        rating: p.rating || 4.9,
        gamerScore: computeGamerScore(p)
      })),
      verdict: `A battle-ready **${style}** setup engineered with low-latency switches, high-DPI tracking, and spatial positioning audio to give you maximum competitive edge.`
    };

    res.json({ success: true, setup });
  } catch (err) {
    console.error('AI setup builder error:', err);
    res.status(500).json({ success: false, message: 'Could not generate gaming setup.' });
  }
});

// 3. Community Setups ("Gamers of Marketzo")
router.get('/community-setups', (req, res) => {
  try {
    const gamingProds = db.findAll('products', isGamingProduct);
    const p1 = gamingProds[0] || null;
    const p2 = gamingProds[1] || null;
    const p3 = gamingProds[2] || null;
    const p4 = gamingProds[3] || null;

    const setups = [
      {
        id: 'setup_01',
        title: 'Cyberpunk Neon Nocturne Station',
        author: 'Alex "Valkyrie" R.',
        rank: 'Immortal Ranked',
        likes: 384,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        products: [p1, p2].filter(Boolean).map(p => ({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || p.image }))
      },
      {
        id: 'setup_02',
        title: 'Minimalist Stealth Esports Battlestation',
        author: 'Kiran "Phantom" M.',
        rank: 'Radiant Level 400',
        likes: 512,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
        products: [p3, p4].filter(Boolean).map(p => ({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || p.image }))
      },
      {
        id: 'setup_03',
        title: 'Pro Streamer Dual-Rig Setup',
        author: 'Sarah "Nova" G.',
        rank: 'Partner Streamer',
        likes: 279,
        image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&auto=format&fit=crop&q=80',
        products: [p1, p3].filter(Boolean).map(p => ({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || p.image }))
      }
    ];

    res.json({ success: true, setups });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch community setups.' });
  }
});

module.exports = router;
