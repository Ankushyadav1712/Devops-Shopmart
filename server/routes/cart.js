const express = require('express');
const router = express.Router();
const products = require('../data/products');

// In-memory cart store
let cart = [];
let nextCartId = 1;

// GET /api/cart — get cart items with product details
router.get('/', (req, res) => {
  try {
    const cartItems = cart.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: products.find((p) => p.id === item.productId) || null,
    }));

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product ? item.product.price * item.quantity : 0);
    }, 0);

    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      count: cart.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/cart — add item to cart
router.post('/', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const parsedProductId = parseInt(productId);
    const product = products.find((p) => p.id === parsedProductId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product already in cart
    const existing = cart.find((item) => item.productId === parsedProductId);
    if (existing) {
      existing.quantity += parseInt(quantity);
      return res.json({
        message: 'Cart updated',
        item: { id: existing.id, productId: existing.productId, quantity: existing.quantity },
      });
    }

    const newItem = {
      id: nextCartId++,
      productId: parsedProductId,
      quantity: parseInt(quantity),
    };
    cart.push(newItem);

    res.status(201).json({
      message: 'Item added to cart',
      item: { id: newItem.id, productId: newItem.productId, quantity: newItem.quantity },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/:id — update quantity
router.put('/:id', (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = parseInt(req.params.id);

    if (quantity <= 0) {
      cart = cart.filter((item) => item.id !== itemId);
      return res.json({ message: 'Item removed from cart' });
    }

    const item = cart.find((item) => item.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    item.quantity = parseInt(quantity);
    res.json({
      message: 'Quantity updated',
      item: { id: item.id, productId: item.productId, quantity: item.quantity },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/:id — remove item
router.delete('/:id', (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const index = cart.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    cart.splice(index, 1);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Helper for clearing cart (used by orders and tests) — synchronous
router.clearCart = () => {
  cart = [];
  nextCartId = 1;
};

// Getter for internal cart data (used by orders module)
router._getCartItems = () => [...cart];

module.exports = router;
