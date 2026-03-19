const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/products — list all products, optional ?category= filter and ?search= filter
router.get('/', (req, res) => {
  let result = [...products];
  
  if (req.query.category) {
    result = result.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  if (req.query.featured === 'true') {
    result = result.filter(p => p.featured);
  }

  res.json(result);
});

// GET /api/products/:id — get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

module.exports = router;
