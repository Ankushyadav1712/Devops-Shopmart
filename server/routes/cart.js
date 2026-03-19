const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// GET /api/cart — get cart items with product details
router.get('/', async (req, res) => {
  try {
    const items = await CartItem.find().populate('productId');

    const cartItems = items.map((item) => ({
      id: item._id,
      productId: item.productId?._id,
      quantity: item.quantity,
      product: item.productId
        ? {
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            category: item.productId.category,
            rating: item.productId.rating,
          }
        : null,
    }));

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product ? item.product.price * item.quantity : 0);
    }, 0);

    res.json({ items: cartItems, total: parseFloat(total.toFixed(2)), count: items.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/cart — add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product already in cart
    const existing = await CartItem.findOne({ productId: productId });
    if (existing) {
      existing.quantity += parseInt(quantity);
      await existing.save();
      return res.json({ message: 'Cart updated', item: existing });
    }

    const newItem = await CartItem.create({
      productId: productId,
      quantity: parseInt(quantity),
    });

    res.status(201).json({ message: 'Item added to cart', item: newItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/:id — update quantity
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Item removed from cart' });
    }

    const item = await CartItem.findByIdAndUpdate(
      req.params.id,
      { quantity: parseInt(quantity) },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Quantity updated', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/:id — remove item
router.delete('/:id', async (req, res) => {
  try {
    const item = await CartItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Helper for clearing cart (used by orders)
router.clearCart = async () => {
  await CartItem.deleteMany({});
};

module.exports = router;
