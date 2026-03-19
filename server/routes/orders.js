const express = require('express');
const router = express.Router();
const products = require('../data/products');
const cartRouter = require('./cart');

// In-memory orders storage
let orders = [];

// POST /api/orders — place an order
router.post('/', (req, res) => {
  const { name, email, address } = req.body;
  const cart = cartRouter.getCart();

  if (cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  if (!name || !email || !address) {
    return res.status(400).json({ message: 'Name, email, and address are required' });
  }

  const orderItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: product ? product.name : 'Unknown',
      price: product ? product.price : 0,
      quantity: item.quantity
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: Date.now(),
    customer: { name, email, address },
    items: orderItems,
    total: parseFloat(total.toFixed(2)),
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  cartRouter.clearCart();

  res.status(201).json({ message: 'Order placed successfully', order });
});

// GET /api/orders — get order history
router.get('/', (req, res) => {
  res.json(orders);
});

module.exports = router;
