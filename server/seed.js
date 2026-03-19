/**
 * Database Seed Script
 * Run: node seed.js
 * Seeds the MongoDB database with initial product data.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299.99,
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    rating: 4.7,
    stock: 25,
    featured: true,
  },
  {
    name: 'Smart Watch Pro',
    price: 449.99,
    description:
      'Advanced smartwatch with health monitoring, GPS tracking, and a stunning AMOLED display. Stay connected and healthy on the go.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    rating: 4.5,
    stock: 18,
    featured: true,
  },
  {
    name: 'Premium Leather Jacket',
    price: 189.99,
    description:
      'Handcrafted genuine leather jacket with a modern slim-fit design. Durable, stylish, and perfect for any season.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    category: 'Clothing',
    rating: 4.8,
    stock: 12,
    featured: true,
  },
  {
    name: 'Organic Cotton T-Shirt',
    price: 34.99,
    description:
      'Soft, breathable organic cotton t-shirt available in multiple colors. Eco-friendly and comfortable for everyday wear.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'Clothing',
    rating: 4.3,
    stock: 50,
  },
  {
    name: 'Stainless Steel Coffee Maker',
    price: 129.99,
    description:
      'Professional-grade coffee maker with programmable settings, thermal carafe, and built-in grinder. Brew the perfect cup every morning.',
    image: 'https://images.unsplash.com/photo-1517256064527-9d164d0064e3?w=500',
    category: 'Home & Kitchen',
    rating: 4.6,
    stock: 30,
    featured: true,
  },
  {
    name: 'Minimalist Desk Lamp',
    price: 59.99,
    description:
      'Modern LED desk lamp with adjustable brightness levels and color temperature. Sleek design that complements any workspace.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
    category: 'Home & Kitchen',
    rating: 4.4,
    stock: 40,
  },
  {
    name: 'Bluetooth Portable Speaker',
    price: 79.99,
    description:
      'Waterproof portable speaker with 360° surround sound and 12-hour battery life. Take your music anywhere.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Electronics',
    rating: 4.2,
    stock: 35,
  },
  {
    name: 'Running Shoes Ultra',
    price: 159.99,
    description:
      'Lightweight running shoes with responsive cushioning and breathable mesh upper. Engineered for peak performance.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Clothing',
    rating: 4.6,
    stock: 22,
  },
  {
    name: 'Ceramic Plant Pot Set',
    price: 44.99,
    description:
      'Set of 3 hand-glazed ceramic plant pots in earth tones. Perfect for indoor plants and home decoration.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
    category: 'Home & Kitchen',
    rating: 4.1,
    stock: 45,
  },
  {
    name: 'Bestseller Novel Collection',
    price: 49.99,
    description:
      'Curated collection of 5 bestselling novels from award-winning authors. A must-have for book lovers.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
    category: 'Books',
    rating: 4.9,
    stock: 60,
  },
  {
    name: 'Wireless Charging Pad',
    price: 39.99,
    description:
      'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek, compact design with LED indicator.',
    image: 'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=500',
    category: 'Electronics',
    rating: 4.3,
    stock: 55,
  },
  {
    name: 'Yoga Mat Premium',
    price: 69.99,
    description:
      'Extra-thick, non-slip yoga mat made from eco-friendly materials. Includes carrying strap for easy transport.',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Clothing',
    rating: 4.5,
    stock: 28,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Insert products
    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products`);

    console.log('\n📦 Seeded Products:');
    inserted.forEach((p) => {
      console.log(`  • ${p.name} ($${p.price}) [${p.category}] — ID: ${p._id}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase seeded successfully! ✅');
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
