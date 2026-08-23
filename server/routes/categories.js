const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all categories with product counts
router.get('/', (req, res) => {
  const categories = db.findAll('categories');
  const products = db.findAll('products', p => p.status === 'approved');

  const populated = categories.map(cat => {
    const count = products.filter(p => p.categoryId === cat.id).length;
    return {
      ...cat,
      productCount: count
    };
  });

  res.json({ success: true, categories: populated });
});

// Get all brands
router.get('/brands/all', (req, res) => {
  const brands = db.findAll('brands');
  res.json({ success: true, brands });
});

// Get promotional banners
router.get('/banners/active', (req, res) => {
  const banners = db.findAll('banners', b => b.active);
  banners.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ success: true, banners });
});

module.exports = router;
