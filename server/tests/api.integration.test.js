/**
 * Integration Tests: API + Data Layer
 * 
 * Tests the interaction between Express API routes and the in-memory
 * data store. Validates that endpoints correctly read, create, update,
 * and delete data, and that modules interact properly.
 */
const request = require('supertest');
const app = require('../index');

describe('🔗 API + Data Integration Tests', () => {

  // ─────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // ─────────────────────────────────────────
  // Products API ↔ Data Store
  // ─────────────────────────────────────────
  describe('Products API ↔ Data Store', () => {

    it('GET /api/products — should return all products from data store', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(12);

      // Validate product structure
      const product = res.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('rating');
      expect(product).toHaveProperty('stock');
    });

    it('GET /api/products?category=Electronics — should filter by category', async () => {
      const res = await request(app).get('/api/products?category=Electronics');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('GET /api/products?category=Books — should return books only', async () => {
      const res = await request(app).get('/api/products?category=Books');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Bestseller Novel Collection');
    });

    it('GET /api/products?search=headphones — should search by keyword', async () => {
      const res = await request(app).get('/api/products?search=headphones');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name.toLowerCase()).toContain('headphones');
    });

    it('GET /api/products?featured=true — should return only featured products', async () => {
      const res = await request(app).get('/api/products?featured=true');
      expect(res.statusCode).toBe(200);
      res.body.forEach(product => {
        expect(product.featured).toBe(true);
      });
    });

    it('GET /api/products/:id — should return a single product by ID', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('Wireless Noise-Cancelling Headphones');
    });

    it('GET /api/products/:id — should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  // ─────────────────────────────────────────
  // Cart API ↔ Data Store
  // ─────────────────────────────────────────
  describe('Cart API ↔ Data Store', () => {

    it('GET /api/cart — should return empty cart initially', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(res.body.total).toBeDefined();
      expect(res.body.count).toBeDefined();
    });

    it('POST /api/cart — should add a product to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: 1, quantity: 2 });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Item added to cart');
      expect(res.body.item.productId).toBe(1);
      expect(res.body.item.quantity).toBe(2);
    });

    it('GET /api/cart — should return cart with added item and computed total', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.total).toBeGreaterThan(0);

      // Verify product details are populated
      const cartItem = res.body.items[0];
      expect(cartItem.product).toBeDefined();
      expect(cartItem.product.name).toBe('Wireless Noise-Cancelling Headphones');
    });

    it('POST /api/cart — should increment quantity for duplicate product', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cart updated');
      expect(res.body.item.quantity).toBe(3); // 2 + 1
    });

    it('POST /api/cart — should fail without productId', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ quantity: 1 });
      expect(res.statusCode).toBe(400);
    });

    it('POST /api/cart — should fail for non-existent product', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: 999 });
      expect(res.statusCode).toBe(404);
    });

    it('PUT /api/cart/:id — should update item quantity', async () => {
      // First get the cart to find the item ID
      const cartRes = await request(app).get('/api/cart');
      const itemId = cartRes.body.items[0].id;

      const res = await request(app)
        .put(`/api/cart/${itemId}`)
        .send({ quantity: 5 });
      expect(res.statusCode).toBe(200);
      expect(res.body.item.quantity).toBe(5);
    });

    it('DELETE /api/cart/:id — should remove item from cart', async () => {
      const cartRes = await request(app).get('/api/cart');
      const itemId = cartRes.body.items[0].id;

      const res = await request(app).delete(`/api/cart/${itemId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Item removed from cart');
    });

    it('DELETE /api/cart/:id — should return 404 for non-existent item', async () => {
      const res = await request(app).delete('/api/cart/99999999');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─────────────────────────────────────────
  // Orders API ↔ Cart + Data
  // ─────────────────────────────────────────
  describe('Orders API ↔ Cart + Data (Cross-Module)', () => {

    it('POST /api/orders — should fail when cart is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Test', email: 'test@test.com', address: '123 St' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });

    it('should complete full flow: add to cart → place order → cart cleared', async () => {
      // Step 1: Add items to cart
      await request(app).post('/api/cart').send({ productId: 2, quantity: 1 });
      await request(app).post('/api/cart').send({ productId: 5, quantity: 2 });

      // Step 2: Verify cart has items
      const cartRes = await request(app).get('/api/cart');
      expect(cartRes.body.items.length).toBe(2);
      expect(cartRes.body.total).toBeGreaterThan(0);

      // Step 3: Place order
      const orderRes = await request(app)
        .post('/api/orders')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          address: '123 Main St, New York, 10001'
        });
      expect(orderRes.statusCode).toBe(201);
      expect(orderRes.body.message).toBe('Order placed successfully');
      expect(orderRes.body.order.customer.name).toBe('John Doe');
      expect(orderRes.body.order.items.length).toBe(2);
      expect(orderRes.body.order.total).toBeGreaterThan(0);
      expect(orderRes.body.order.status).toBe('confirmed');

      // Step 4: Verify cart is cleared after order
      const emptyCart = await request(app).get('/api/cart');
      expect(emptyCart.body.items.length).toBe(0);
      expect(emptyCart.body.total).toBe(0);

      // Step 5: Verify order appears in history
      const ordersRes = await request(app).get('/api/orders');
      expect(ordersRes.body.length).toBeGreaterThan(0);
      const lastOrder = ordersRes.body[ordersRes.body.length - 1];
      expect(lastOrder.customer.email).toBe('john@example.com');
    });

    it('POST /api/orders — should fail without required fields', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 1 });
      
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Test' }); // missing email and address
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Name, email, and address are required');
    });
  });
});
