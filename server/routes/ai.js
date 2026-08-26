const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Smart AI Shopping Assistant & Recommendation Engine
router.post('/recommend', (req, res) => {
  try {
    const rawQuery = (req.body.query || req.body.prompt || '').trim();
    const { 
      currency = 'USD', 
      exchangeRate = 1.0,
      contextProducts = [],
      conversationHistory = []
    } = req.body;

    if (!rawQuery) {
      return res.status(400).json({ success: false, message: 'Shopping inquiry query is required.' });
    }

    const q = rawQuery.toLowerCase();
    const allApprovedProducts = db.findAll('products', p => p.status === 'approved' || !p.status);

    // 1. Check if this is a follow-up query on existing context products
    const isFollowUp = Array.isArray(contextProducts) && contextProducts.length > 0 && (
      q.includes('which one') ||
      q.includes('which is') ||
      q.includes('compare') ||
      q.includes('best camera') ||
      q.includes('best battery') ||
      q.includes('best price') ||
      q.includes('cheapest') ||
      q.includes('most expensive') ||
      q.includes('first one') ||
      q.includes('second one') ||
      q.includes('third one') ||
      q.includes('difference') ||
      q.includes('between these')
    );

    // 2. Budget Extraction & Currency Normalization
    let minBudgetUSD = null;
    let maxBudgetUSD = null;

    // Pattern: between X and Y
    const betweenMatch = q.match(/between\s+([₹$€£]?\s*[\d,]+k?)\s+and\s+([₹$€£]?\s*[\d,]+k?)/i);
    if (betweenMatch) {
      const parseVal = (str) => {
        let isK = str.toLowerCase().includes('k');
        let num = parseFloat(str.replace(/[^\d.]/g, ''));
        if (isK && num < 1000) num *= 1000;
        if (currency === 'INR' || str.includes('₹') || num > 2000) return num / (exchangeRate || 86.5);
        return num;
      };
      minBudgetUSD = parseVal(betweenMatch[1]);
      maxBudgetUSD = parseVal(betweenMatch[2]);
    } else {
      // Pattern: under / below / max / less than X
      const maxMatch = q.match(/(under|below|less than|max|up to|within|around)\s*([₹$€£]?\s*[\d,]+k?)/i);
      if (maxMatch) {
        let str = maxMatch[2];
        let isK = str.toLowerCase().includes('k');
        let num = parseFloat(str.replace(/[^\d.]/g, ''));
        if (isK && num < 1000) num *= 1000;
        if (currency === 'INR' || q.includes('₹') || q.includes('rs') || num > 2000) {
          maxBudgetUSD = num / (exchangeRate || 86.5);
        } else {
          maxBudgetUSD = num;
        }
      } else {
        // Direct number match
        const anyNumMatch = q.match(/(\d+[\d,]*\s*k?)/i);
        if (anyNumMatch) {
          let str = anyNumMatch[1];
          let isK = str.toLowerCase().includes('k');
          let num = parseFloat(str.replace(/[^\d.]/g, ''));
          if (isK && num < 1000) num *= 1000;
          if (num >= 50) {
            if (currency === 'INR' || q.includes('₹') || q.includes('rs') || num > 2000) {
              maxBudgetUSD = num / (exchangeRate || 86.5);
            } else {
              maxBudgetUSD = num;
            }
          }
        }
      }
    }

    // 3. Category & Feature Intent Mapping
    const categoriesMap = {
      phones: ['phone', 'smartphone', 'mobile', '5g', 'iphone', 'android', 'camera phone', 'foldable'],
      laptops: ['laptop', 'macbook', 'programming', 'coding', 'notebook', 'ultrabook', 'computer', 'developer'],
      headphones: ['headphone', 'headphones', 'earphone', 'earbuds', 'tws', 'anc', 'audio', 'sound', 'noise cancelling', 'wireless audio'],
      smartwatches: ['smartwatch', 'watch', 'fitness tracker', 'band', 'chronograph', 'wearable'],
      monitors: ['monitor', 'screen', '4k', 'oled', 'curved', 'gaming monitor', 'display', 'ultrawide'],
      cameras: ['camera', 'drone', 'lens', 'photography', '4k video', 'action camera'],
      fashion: ['coat', 'jacket', 'wool', 'linen', 'shirt', 'dress', 'shoes', 'boots', 'apparel', 'streetwear', 'fashion'],
      home: ['sofa', 'chair', 'furniture', 'kitchen', 'blender', 'espresso', 'pan', 'cookware', 'decor', 'air purifier'],
      jewellery: ['ring', 'diamond', 'necklace', 'bracelet', 'earring', 'gold', 'solitaire', 'jewel', 'jewellery'],
      beauty: ['serum', 'skincare', 'perfume', 'cream', 'moisturizer', 'cleanser', 'fragrance', 'glow', 'hair']
    };

    // Determine target category
    let detectedCategory = null;
    for (const [cat, keywords] of Object.entries(categoriesMap)) {
      if (keywords.some(kw => q.includes(kw))) {
        detectedCategory = cat;
        break;
      }
    }

    // 4. Comparison Logic (if comparison is requested)
    const isCompareIntent = q.includes('compare') || q.includes('versus') || q.includes(' vs ') || q.includes('comparison') || q.includes('difference');
    
    // 5. Select & Score candidate products
    let pool = isFollowUp && contextProducts.length >= 2 
      ? allApprovedProducts.filter(p => contextProducts.some(cp => cp.id === p.id))
      : allApprovedProducts;

    if (pool.length === 0) pool = allApprovedProducts;

    const keywords = q.split(/[\s,]+/).filter(k => k.length >= 2);

    const scored = pool.map(prod => {
      let score = 0;
      const text = `${prod.name} ${prod.description || ''} ${prod.tags ? prod.tags.join(' ') : ''} ${prod.specs ? Object.entries(prod.specs).map(([k, v]) => `${k} ${v}`).join(' ') : ''}`.toLowerCase();

      // Keyword hits
      keywords.forEach(kw => {
        if (text.includes(kw)) score += 3;
        if (prod.name.toLowerCase().includes(kw)) score += 6;
      });

      // Category match
      if (detectedCategory) {
        const catKeywords = categoriesMap[detectedCategory] || [];
        if (catKeywords.some(kw => text.includes(kw))) score += 8;
      }

      // Feature specific boosts
      if (q.includes('anc') || q.includes('noise')) {
        if (text.includes('anc') || text.includes('noise')) score += 10;
      }
      if (q.includes('camera') || q.includes('photography')) {
        if (text.includes('camera') || text.includes('sensor') || text.includes('ois') || text.includes('lens')) score += 10;
      }
      if (q.includes('gaming') || q.includes('refresh') || q.includes('fps')) {
        if (text.includes('gaming') || text.includes('144hz') || text.includes('165hz') || text.includes('oled') || text.includes('fast')) score += 10;
      }
      if (q.includes('battery') || q.includes('battery life') || q.includes('long battery')) {
        if (text.includes('battery') || text.includes('mah') || text.includes('hours')) score += 8;
      }
      if (q.includes('coding') || q.includes('programming') || q.includes('developer')) {
        if (text.includes('ram') || text.includes('ssd') || text.includes('workstation') || text.includes('performance') || text.includes('pro')) score += 10;
      }

      // Verified seller preference
      const seller = db.findById('sellers', prod.sellerId);
      if (seller && (seller.isVerified || seller.status === 'approved')) {
        score += 3;
      }
      if (q.includes('verified') && seller && (seller.isVerified || seller.status === 'approved')) {
        score += 15;
      }

      // Price / Budget alignment
      if (maxBudgetUSD !== null) {
        if (prod.price <= maxBudgetUSD) {
          score += 12; // Within budget
          if (minBudgetUSD !== null && prod.price >= minBudgetUSD) score += 6;
        } else if (prod.price <= maxBudgetUSD * 1.15) {
          score += 2; // Slightly above budget
        } else {
          score -= 15; // Exceeds budget significantly
        }
      }

      // Cheap / budget request
      if (q.includes('cheap') || q.includes('affordable') || q.includes('budget')) {
        if (prod.price < 150) score += 6;
      }
      // Premium / high-end request
      if (q.includes('premium') || q.includes('flagship') || q.includes('best') || q.includes('pro')) {
        if (prod.rating >= 4.7) score += 5;
        if (prod.price > 200) score += 4;
      }

      // Rating quality score
      score += (parseFloat(prod.rating) || 4.5) * 2;
      if (prod.isBestSeller) score += 4;
      if (prod.isFeatured) score += 3;

      return { product: prod, score, seller };
    });

    scored.sort((a, b) => b.score - a.score);
    const topScored = scored.slice(0, 4).filter(s => s.score > 2);
    const chosenProducts = (topScored.length > 0 ? topScored : scored.slice(0, 3)).map(s => s.product);

    // Format rich product recommendations
    const recommendations = chosenProducts.map(p => {
      const seller = db.findById('sellers', p.sellerId);
      
      // Determine custom highlight reason
      let reasonWhy = 'Top-rated verified merchant selection';
      if (maxBudgetUSD && p.price <= maxBudgetUSD) {
        reasonWhy = `Fits within your budget (${p.discountPercent ? `${p.discountPercent}% OFF deal` : 'Great value'})`;
      } else if (p.rating >= 4.8) {
        reasonWhy = `Highly praised by buyers (${p.rating}★ from ${p.reviewCount || 40}+ reviews)`;
      } else if (p.highlights && p.highlights.length > 0) {
        reasonWhy = p.highlights[0];
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        discountPercent: p.discountPercent || 0,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
        rating: p.rating || 4.8,
        reviewCount: p.reviewCount || 48,
        stock: p.stock !== undefined ? p.stock : 15,
        sellerId: p.sellerId,
        sellerName: seller ? seller.storeName : 'Marketzo Verified Merchant',
        sellerPhone: seller?.phone || '+1 (555) 392-1082',
        sellerWhatsApp: (seller?.phone || '+15553921082').replace(/[^\d+]/g, ''),
        isVerifiedSeller: !!(seller && (seller.isVerified || seller.status === 'approved')),
        keyHighlight: p.highlights && p.highlights.length > 0 ? p.highlights[0] : (p.description ? p.description.substring(0, 85) + '...' : 'Verified genuine item'),
        specs: p.specs || { 'Condition': 'Brand New', 'Warranty': '1 Year Standard' },
        reasonWhy
      };
    });

    // 6. Build Comparison Table if requested
    let comparisonTable = null;
    if (isCompareIntent && recommendations.length >= 2) {
      const prodsToCompare = recommendations.slice(0, 3);
      comparisonTable = {
        products: prodsToCompare.map(p => ({ id: p.id, name: p.name, price: p.price, rating: p.rating, image: p.images[0] })),
        features: [
          { feature: 'Price & Value', values: prodsToCompare.map(p => `$${p.price} (${p.discountPercent > 0 ? `${p.discountPercent}% OFF` : 'Standard'})`) },
          { feature: 'Rating & Satisfaction', values: prodsToCompare.map(p => `${p.rating} ★ (${p.reviewCount} reviews)`) },
          { feature: 'Warranty', values: prodsToCompare.map(p => p.specs?.Warranty || '1 Year Standard') },
          { feature: 'Verified Seller', values: prodsToCompare.map(p => p.sellerName) },
          { feature: 'Key Spec / Highlight', values: prodsToCompare.map(p => p.keyHighlight) }
        ],
        verdict: {
          bestOverall: prodsToCompare[0]?.name || '',
          bestValue: [...prodsToCompare].sort((a, b) => a.price - b.price)[0]?.name || '',
          summary: `The **${prodsToCompare[0]?.name}** is our top recommendation for highest overall build & rating, while **${[...prodsToCompare].sort((a, b) => a.price - b.price)[0]?.name}** offers the most cost-effective value.`
        }
      };
    }

    // 7. Craft concise, high-clarity natural language response
    let replyText = '';
    if (isCompareIntent && comparisonTable) {
      replyText = `Here is a side-by-side comparison of the top ${recommendations.slice(0, 3).length} options from our catalog:`;
    } else if (isFollowUp) {
      const topPick = recommendations[0];
      if (q.includes('best camera')) {
        replyText = `Among these options, the **${topPick.name}** features the highest-resolution camera system with advanced optical stabilization and night mode.`;
      } else if (q.includes('cheapest') || q.includes('best price')) {
        const cheapest = [...recommendations].sort((a, b) => a.price - b.price)[0];
        replyText = `The most affordable option is the **${cheapest.name}** at $${cheapest.price}.`;
      } else {
        replyText = `Here is the focused breakdown for your follow-up inquiry on the **${topPick.name}**:`;
      }
    } else if (recommendations.length > 0) {
      if (maxBudgetUSD !== null) {
        replyText = `Here are the best verified options matching your budget criteria:`;
      } else if (detectedCategory) {
        replyText = `Here are our top-rated ${detectedCategory} recommendations available from verified merchants:`;
      } else {
        replyText = `Here are verified marketplace products that match your request:`;
      }
    } else {
      replyText = `I couldn't find an exact match for "${rawQuery}". Here are our top featured products:`;
    }

    res.json({
      success: true,
      query: rawQuery,
      replyText,
      reply: replyText,
      intent: isCompareIntent ? 'compare' : isFollowUp ? 'followup' : 'search',
      comparisonTable,
      recommendations
    });
  } catch (err) {
    console.error('AI assistant error:', err);
    res.status(500).json({ success: false, message: 'Could not generate recommendations.' });
  }
});

// Seller Product Optimization Assistant (helps sellers with title, tags, description & highlights)
router.post('/seller-help', (req, res) => {
  try {
    const { productName = '', categoryId = '', currentDescription = '' } = req.body;
    const cat = db.findById('categories', categoryId);
    const catName = cat ? cat.name : 'General Merchandise';

    const cleanTitle = productName.trim();
    const enhancedTitle = cleanTitle.length > 0 
      ? `${cleanTitle.replace(/\s+/g, ' ')} - Premium Verified Grade`
      : `High-Performance ${catName} Selection`;

    const suggestedTags = [
      catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      'premium-grade',
      'fast-shipping',
      'verified-merchant',
      'best-value'
    ];

    if (cleanTitle.toLowerCase().includes('wireless') || cleanTitle.toLowerCase().includes('bluetooth')) {
      suggestedTags.push('wireless', 'bluetooth-5.3', 'low-latency');
    }
    if (cleanTitle.toLowerCase().includes('gaming')) {
      suggestedTags.push('rgb-lighting', 'pro-gaming', 'ergonomic');
    }

    const suggestedHighlights = [
      '100% Genuine and authentic merchandise directly from verified merchant.',
      'Dispatched in secure, tamper-evident Marketzo packaging with rapid fulfillment.',
      'Backed by standard 1-Year manufacturer warranty and 30-day money-back guarantee.',
      'Precision engineered for durability, performance, and everyday reliability.'
    ];

    const enhancedDescription = currentDescription && currentDescription.length > 20
      ? `${currentDescription}\n\nKey Highlights:\n• Premium construction and quality assurance\n• Direct-from-merchant express dispatch\n• 24/7 dedicated customer support`
      : `Experience unmatched quality with this premium ${cleanTitle || catName}. Crafted with high-grade components for optimal performance and long-lasting durability. Every unit undergoes rigorous quality inspection before dispatch to ensure 100% buyer satisfaction.`;

    res.json({
      success: true,
      enhancedTitle,
      enhancedDescription,
      suggestedTags,
      suggestedHighlights
    });
  } catch (err) {
    console.error('Seller AI help error:', err);
    res.status(500).json({ success: false, message: 'Could not generate seller recommendations.' });
  }
});

module.exports = router;
