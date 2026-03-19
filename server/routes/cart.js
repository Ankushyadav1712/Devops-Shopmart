const express = require('express');
const router = express.Router();
const products = require('../data/products');

// In-memory cart storage
let cart = [];

// GET /api/cart — get cart items
router.get('/', (req, res) => {
  const cartWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: product || null
    };
  });
  
  const total = cartWithDetails.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  res.json({ items: cartWithDetails, total: parseFloat(total.toFixed(2)), count: cart.length });
});

// POST /api/cart — add item to cart
router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  const product = products.find(p => p.id === parseInt(productId));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const existing = cart.find(item => item.productId === parseInt(productId));
  if (existing) {
    existing.quantity += parseInt(quantity);
    return res.json({ message: 'Cart updated', item: existing });
  }

  const newItem = {
    id: Date.now(),
    productId: parseInt(productId),
    quantity: parseInt(quantity)
  };
  cart.push(newItem);
  res.status(201).json({ message: 'Item added to cart', item: newItem });
});

// PUT /api/cart/:id — update quantity
router.put('/:id', (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(i => i.id === parseInt(req.params.id));

  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  if (quantity <= 0) {
    cart = cart.filter(i => i.id !== parseInt(req.params.id));
    return res.json({ message: 'Item removed from cart' });
  }

  item.quantity = parseInt(quantity);
  res.json({ message: 'Quantity updated', item });
});

// DELETE /api/cart/:id — remove item
router.delete('/:id', (req, res) => {
  const index = cart.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  cart.splice(index, 1);
  res.json({ message: 'Item removed from cart' });
});

// Export cart reference for orders
router.clearCart = () => { cart = []; };
router.getCart = () => cart;

module.exports = router;
