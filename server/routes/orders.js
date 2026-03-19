const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// POST /api/orders — place an order
router.post('/', async (req, res) => {
  try {
    const { name, email, address } = req.body;

    // Get cart items with product details
    const cartItems = await CartItem.find().populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }

    const orderItems = cartItems.map(item => ({
      productId: item.productId?._id,
      name: item.productId ? item.productId.name : 'Unknown',
      price: item.productId ? item.productId.price : 0,
      quantity: item.quantity
    }));

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customer: { name, email, address },
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      status: 'confirmed'
    });

    // Clear cart after successful order
    await CartItem.deleteMany({});

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/orders — get order history
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
