const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DEALS_FILE = path.join(__dirname, '../data/deals.json');

// GET /api/deals
// Query params: category, minDiscount, minPrice, maxPrice
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(DEALS_FILE)) {
      return res.json([]);
    }

    let deals = JSON.parse(fs.readFileSync(DEALS_FILE, 'utf8'));
    const { category, minDiscount, minPrice, maxPrice } = req.query;

    if (category && category !== 'all') {
      deals = deals.filter((d) => d.category === category);
    }
    if (minDiscount) {
      deals = deals.filter((d) => d.discountPercentage >= parseInt(minDiscount, 10));
    }
    if (minPrice) {
      deals = deals.filter((d) => d.discountedPrice >= parseFloat(minPrice));
    }
    if (maxPrice) {
      deals = deals.filter((d) => d.discountedPrice <= parseFloat(maxPrice));
    }

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deals/stats — useful for a dashboard later
router.get('/stats', (req, res) => {
  try {
    if (!fs.existsSync(DEALS_FILE)) {
      return res.json({ total: 0, byCategory: {}, byStore: {}, lastUpdated: null });
    }
    const deals = JSON.parse(fs.readFileSync(DEALS_FILE, 'utf8'));
    const byCategory = {};
    const byStore = {};

    deals.forEach((d) => {
      byCategory[d.category] = (byCategory[d.category] || 0) + 1;
      byStore[d.affiliateStore] = (byStore[d.affiliateStore] || 0) + 1;
    });

    res.json({
      total: deals.length,
      byCategory,
      byStore,
      lastUpdated: deals[0]?.fetchedAt || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;