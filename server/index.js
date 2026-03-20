require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Export app for testing
module.exports = app;

// Only listen and connect to DB when run directly (not imported by tests)
if (require.main === module) {
  const connectDB = require('./config/db');
  const PORT = process.env.PORT || 5001;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`ShopMart API running on http://localhost:${PORT}`);
    });
  });
}
