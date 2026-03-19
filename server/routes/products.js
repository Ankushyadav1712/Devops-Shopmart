const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — list all products, optional ?category= filter and ?search= filter
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.category) {
      query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }

    if (req.query.search) {
      const search = req.query.search;
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.query.featured === 'true') {
      query.featured = true;
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
