const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/products — list all products, optional ?category=, ?search=, ?featured= filters
router.get('/', (req, res) => {
  try {
    let filtered = [...products];

    if (req.query.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }

    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }

    if (req.query.featured === 'true') {
      filtered = filtered.filter((p) => p.featured);
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', (req, res) => {
  try {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
