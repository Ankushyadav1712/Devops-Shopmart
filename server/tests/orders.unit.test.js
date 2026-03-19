/**
 * Unit Tests: Order Route Logic
 *
 * Tests the order module's individual functions in isolation.
 * Validates input handling, order creation, cart clearing,
 * and order history retrieval.
 */
const request = require('supertest');
const app = require('../index');
const cartRouter = require('../routes/cart');
const orderRouter = require('../routes/orders');

describe('📋 Order Route Logic — Unit Tests', () => {
  // Reset cart and orders before each test for isolation
  beforeEach(() => {
    cartRouter.clearCart();
    orderRouter.resetOrders();
  });

  // ─────────────────────────────────────────
  // Input Validation
  // ─────────────────────────────────────────
  describe('POST /api/orders — Input Validation', () => {
    it('should reject order when cart is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Test', email: 'test@test.com', address: '123 St' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });

    it('should reject order without name', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ email: 'test@test.com', address: '123 St' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Name, email, and address are required');
    });

    it('should reject order without email', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app).post('/api/orders').send({ name: 'Test', address: '123 St' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject order without address', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Test', email: 'test@test.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  // ─────────────────────────────────────────
  // Order Creation
  // ─────────────────────────────────────────
  describe('POST /api/orders — Order Creation', () => {
    it('should create order with correct customer info', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Alice', email: 'alice@mail.com', address: '456 Elm St' });
      expect(res.statusCode).toBe(201);
      expect(res.body.order.customer.name).toBe('Alice');
      expect(res.body.order.customer.email).toBe('alice@mail.com');
      expect(res.body.order.customer.address).toBe('456 Elm St');
    });

    it('should include correct order items with product details', async () => {
      await request(app).post('/api/cart').send({ productId: 2, quantity: 2 });
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Bob', email: 'bob@mail.com', address: '789 Oak Ave' });
      expect(res.body.order.items.length).toBe(1);
      expect(res.body.order.items[0].name).toBe('Smart Watch Pro');
      expect(res.body.order.items[0].price).toBe(449.99);
      expect(res.body.order.items[0].quantity).toBe(2);
    });

    it('should calculate correct order total', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 1 }); // 299.99
      await request(app).post('/api/cart').send({ productId: 4, quantity: 3 }); // 34.99 * 3
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Carol', email: 'carol@mail.com', address: '321 Pine Ln' });
      const expectedTotal = parseFloat((299.99 + 34.99 * 3).toFixed(2));
      expect(res.body.order.total).toBe(expectedTotal);
    });

    it('should set order status to confirmed', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Dave', email: 'dave@mail.com', address: '654 Maple Dr' });
      expect(res.body.order.status).toBe('confirmed');
    });

    it('should include createdAt timestamp', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app)
        .post('/api/orders')
        .send({ name: 'Eve', email: 'eve@mail.com', address: '987 Cedar Ct' });
      expect(res.body.order.createdAt).toBeDefined();
      expect(new Date(res.body.order.createdAt).toString()).not.toBe('Invalid Date');
    });

    it('should generate unique order IDs', async () => {
      // Order 1
      await request(app).post('/api/cart').send({ productId: 1 });
      const res1 = await request(app)
        .post('/api/orders')
        .send({ name: 'A', email: 'a@a.com', address: '1 St' });
      // Order 2
      await request(app).post('/api/cart').send({ productId: 2 });
      const res2 = await request(app)
        .post('/api/orders')
        .send({ name: 'B', email: 'b@b.com', address: '2 St' });
      expect(res1.body.order.id).not.toBe(res2.body.order.id);
    });
  });

  // ─────────────────────────────────────────
  // Cart Clearing After Order
  // ─────────────────────────────────────────
  describe('POST /api/orders — Cart Clearing', () => {
    it('should clear cart after placing order', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      await request(app).post('/api/cart').send({ productId: 2 });
      await request(app)
        .post('/api/orders')
        .send({ name: 'Tester', email: 't@t.com', address: '1 Test St' });
      const cartRes = await request(app).get('/api/cart');
      expect(cartRes.body.items.length).toBe(0);
      expect(cartRes.body.total).toBe(0);
    });
  });

  // ─────────────────────────────────────────
  // GET /api/orders — Order History
  // ─────────────────────────────────────────
  describe('GET /api/orders — Order History', () => {
    it('should return empty array when no orders placed', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return all placed orders', async () => {
      // Place 2 orders
      await request(app).post('/api/cart').send({ productId: 1 });
      await request(app).post('/api/orders').send({ name: 'A', email: 'a@a.com', address: '1' });
      await request(app).post('/api/cart').send({ productId: 2 });
      await request(app).post('/api/orders').send({ name: 'B', email: 'b@b.com', address: '2' });

      const res = await request(app).get('/api/orders');
      expect(res.body.length).toBe(2);
      expect(res.body[0].customer.name).toBe('A');
      expect(res.body[1].customer.name).toBe('B');
    });

    it('order history should preserve order details', async () => {
      await request(app).post('/api/cart').send({ productId: 5, quantity: 2 });
      await request(app)
        .post('/api/orders')
        .send({ name: 'Charlie', email: 'charlie@mail.com', address: '123 Test Ave' });

      const res = await request(app).get('/api/orders');
      const order = res.body[0];
      expect(order.customer.name).toBe('Charlie');
      expect(order.items.length).toBe(1);
      expect(order.items[0].quantity).toBe(2);
      expect(order.total).toBeGreaterThan(0);
      expect(order.status).toBe('confirmed');
    });
  });
});
