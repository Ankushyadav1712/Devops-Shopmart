/**
 * Unit Tests: Cart Route Logic
 *
 * Tests the cart module's individual handlers as units,
 * focusing on input validation, edge cases, and data transformations.
 * Uses beforeEach to reset cart state between tests.
 */
const request = require('supertest');
const app = require('../index');
const cartRouter = require('../routes/cart');

describe('🛒 Cart Route Logic — Unit Tests', () => {
  // Reset cart before each test for isolation
  beforeEach(() => {
    cartRouter.clearCart();
  });

  // ─────────────────────────────────────────
  // GET /api/cart — Empty state
  // ─────────────────────────────────────────
  describe('GET /api/cart — Initial State', () => {
    it('should return empty items array', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.body.items).toEqual([]);
    });

    it('should return total of 0', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.body.total).toBe(0);
    });

    it('should return count of 0', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.body.count).toBe(0);
    });
  });

  // ─────────────────────────────────────────
  // POST /api/cart — Input Validation
  // ─────────────────────────────────────────
  describe('POST /api/cart — Input Validation', () => {
    it('should reject request with no body', async () => {
      const res = await request(app).post('/api/cart').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('productId is required');
    });

    it('should reject non-existent productId', async () => {
      const res = await request(app).post('/api/cart').send({ productId: 9999 });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });

    it('should default quantity to 1 when not provided', async () => {
      const res = await request(app).post('/api/cart').send({ productId: 1 });
      expect(res.statusCode).toBe(201);
      expect(res.body.item.quantity).toBe(1);
    });

    it('should accept string productId and parse to integer', async () => {
      const res = await request(app).post('/api/cart').send({ productId: '3' });
      expect(res.statusCode).toBe(201);
      expect(res.body.item.productId).toBe(3);
    });
  });

  // ─────────────────────────────────────────
  // POST /api/cart — Add Logic
  // ─────────────────────────────────────────
  describe('POST /api/cart — Add Item Logic', () => {
    it('should create new cart item with correct fields', async () => {
      const res = await request(app).post('/api/cart').send({ productId: 5, quantity: 3 });
      expect(res.body.item).toHaveProperty('id');
      expect(res.body.item.productId).toBe(5);
      expect(res.body.item.quantity).toBe(3);
    });

    it('should generate unique IDs for cart items', async () => {
      const res1 = await request(app).post('/api/cart').send({ productId: 1 });
      const res2 = await request(app).post('/api/cart').send({ productId: 2 });
      expect(res1.body.item.id).not.toBe(res2.body.item.id);
    });

    it('should increment quantity when adding same product twice', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 2 });
      const res = await request(app).post('/api/cart').send({ productId: 1, quantity: 3 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cart updated');
      expect(res.body.item.quantity).toBe(5); // 2 + 3
    });
  });

  // ─────────────────────────────────────────
  // GET /api/cart — Total Calculation
  // ─────────────────────────────────────────
  describe('GET /api/cart — Total Calculation', () => {
    it('should correctly compute total for single item', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 2 });
      const res = await request(app).get('/api/cart');
      // Product 1 price is 299.99
      expect(res.body.total).toBeCloseTo(299.99 * 2, 2);
    });

    it('should correctly compute total for multiple items', async () => {
      await request(app).post('/api/cart').send({ productId: 1, quantity: 1 }); // 299.99
      await request(app).post('/api/cart').send({ productId: 4, quantity: 2 }); // 34.99 * 2
      const res = await request(app).get('/api/cart');
      expect(res.body.total).toBeCloseTo(299.99 + 34.99 * 2, 2);
    });

    it('should populate product details in cart items', async () => {
      await request(app).post('/api/cart').send({ productId: 3 });
      const res = await request(app).get('/api/cart');
      const item = res.body.items[0];
      expect(item.product).not.toBeNull();
      expect(item.product.name).toBe('Premium Leather Jacket');
      expect(item.product.price).toBe(189.99);
    });
  });

  // ─────────────────────────────────────────
  // PUT /api/cart/:id — Update Logic
  // ─────────────────────────────────────────
  describe('PUT /api/cart/:id — Update Quantity', () => {
    it('should update quantity to specified value', async () => {
      const addRes = await request(app).post('/api/cart').send({ productId: 1 });
      const itemId = addRes.body.item.id;
      const res = await request(app).put(`/api/cart/${itemId}`).send({ quantity: 10 });
      expect(res.body.item.quantity).toBe(10);
    });

    it('should remove item when quantity set to 0', async () => {
      const addRes = await request(app).post('/api/cart').send({ productId: 1 });
      const itemId = addRes.body.item.id;
      const res = await request(app).put(`/api/cart/${itemId}`).send({ quantity: 0 });
      expect(res.body.message).toBe('Item removed from cart');
      const cartRes = await request(app).get('/api/cart');
      expect(cartRes.body.items.length).toBe(0);
    });

    it('should return 404 for non-existent cart item', async () => {
      const res = await request(app).put('/api/cart/99999').send({ quantity: 1 });
      expect(res.statusCode).toBe(404);
    });
  });

  // ─────────────────────────────────────────
  // DELETE /api/cart/:id — Remove Logic
  // ─────────────────────────────────────────
  describe('DELETE /api/cart/:id — Remove Item', () => {
    it('should remove the correct item and keep the other', async () => {
      const res1 = await request(app).post('/api/cart').send({ productId: 7 });
      const res2 = await request(app).post('/api/cart').send({ productId: 9 });
      const keptItemId = res1.body.item.id;
      const deletedItemId = res2.body.item.id;

      await request(app).delete(`/api/cart/${deletedItemId}`);
      const cartRes = await request(app).get('/api/cart');
      expect(cartRes.body.items.length).toBe(1);
      // The kept item should still be there
      expect(cartRes.body.items[0].id).toBe(keptItemId);
      // The deleted item should not be there
      const deletedExists = cartRes.body.items.some((i) => i.id === deletedItemId);
      expect(deletedExists).toBe(false);
    });

    it('should return 404 for already-deleted item', async () => {
      const addRes = await request(app).post('/api/cart').send({ productId: 1 });
      const itemId = addRes.body.item.id;
      await request(app).delete(`/api/cart/${itemId}`);
      const res = await request(app).delete(`/api/cart/${itemId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
