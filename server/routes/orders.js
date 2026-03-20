const express = require('express');
const router = express.Router();
const products = require('../data/products');
const cartRouter = require('./cart');

// In-memory orders store
let orders = [];
let nextOrderId = 1;

// POST /api/orders — place an order
router.post('/', (req, res) => {
  try {
    const { name, email, address } = req.body;

    // Get current cart by simulating internal request
    // We access the cart module's internal state through its GET handler
    // Instead, we'll directly check the cart via a helper
    const cartItems = getCartItems();

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }

    const orderItems = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product ? product.name : 'Unknown',
        price: product ? product.price : 0,
        quantity: item.quantity,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      id: nextOrderId++,
      customer: { name, email, address },
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    // Clear cart after successful order
    cartRouter.clearCart();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/orders — get order history
router.get('/', (req, res) => {
  try {
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Helper to access cart items from cart module
function getCartItems() {
  return cartRouter._getCartItems();
}

// Helper for resetting orders (used by tests)
router.resetOrders = () => {
  orders = [];
  nextOrderId = 1;
};

module.exports = router;
