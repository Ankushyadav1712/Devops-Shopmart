/**
 * Integration Tests: Frontend ↔ Backend
 *
 * Tests the full end-to-end flow that the React frontend performs
 * against the Express backend API. Simulates the exact API calls
 * the frontend makes during user workflows.
 */
const request = require('supertest');
const app = require('../index');

describe('🌐 Frontend ↔ Backend Integration Tests', () => {
  // ─────────────────────────────────────────
  // Home Page Data Loading
  // ─────────────────────────────────────────
  describe('Home Page — Featured Products Loading', () => {
    it('should load featured products for the hero section', async () => {
      // Frontend Home.jsx calls: fetchProducts({ featured: true })
      const res = await request(app).get('/api/products?featured=true');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Each product should have all fields the ProductCard component needs
      res.body.forEach((product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('rating');
        expect(typeof product.price).toBe('number');
        expect(typeof product.rating).toBe('number');
      });
    });
  });

  // ─────────────────────────────────────────
  // Products Page — Search & Filter
  // ─────────────────────────────────────────
  describe('Products Page — Search & Category Filter', () => {
    it('should load all products (no filters)', async () => {
      // Frontend Products.jsx calls: fetchProducts({})
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(12);
    });

    it('should filter by category from URL params', async () => {
      // Frontend reads ?category= from URL searchParams
      const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books'];

      for (const category of categories) {
        const res = await request(app).get(
          `/api/products?category=${encodeURIComponent(category)}`
        );
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach((p) => expect(p.category).toBe(category));
      }
    });

    it('should support search with debounce simulation', async () => {
      // Frontend sends search query after 300ms debounce
      const res = await request(app).get('/api/products?search=watch');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const hasMatch = res.body.some(
        (p) =>
          p.name.toLowerCase().includes('watch') || p.description.toLowerCase().includes('watch')
      );
      expect(hasMatch).toBe(true);
    });

    it('should combine category + search filters', async () => {
      const res = await request(app).get('/api/products?category=Electronics&search=wireless');
      expect(res.statusCode).toBe(200);
      res.body.forEach((p) => {
        expect(p.category).toBe('Electronics');
        const matchesSearch =
          p.name.toLowerCase().includes('wireless') ||
          p.description.toLowerCase().includes('wireless');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app).get('/api/products?search=xyznonexistent');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────
  // Product Detail Page
  // ─────────────────────────────────────────
  describe('Product Detail Page — Data Loading', () => {
    it('should load single product with all detail fields', async () => {
      // Frontend ProductDetail.jsx calls: fetchProduct(id)
      const res = await request(app).get('/api/products/3');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(3);
      expect(res.body.name).toBeDefined();
      expect(res.body.description).toBeDefined();
      expect(res.body.stock).toBeDefined();
      expect(typeof res.body.stock).toBe('number');
    });

    it('should handle invalid product ID gracefully', async () => {
      const res = await request(app).get('/api/products/0');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─────────────────────────────────────────
  // Cart Page — Full User Flow
  // ─────────────────────────────────────────
  describe('Cart Page — Add / Update / Remove Flow', () => {
    it('should simulate user adding item from ProductCard', async () => {
      // ProductCard calls: addToCart(product.id)
      const res = await request(app).post('/api/cart').send({ productId: 8, quantity: 1 });
      expect(res.statusCode).toBe(201);
    });

    it('should simulate user adding item from ProductDetail with quantity', async () => {
      // ProductDetail calls: addToCart(product.id, quantity)
      const res = await request(app).post('/api/cart').send({ productId: 10, quantity: 3 });
      expect(res.statusCode).toBe(201);
    });

    it('should return cart with product details populated (for Cart page render)', async () => {
      // Cart.jsx calls: fetchCart() and renders product.name, product.image, etc.
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBe(2);

      res.body.items.forEach((item) => {
        expect(item.product).not.toBeNull();
        expect(item.product.name).toBeDefined();
        expect(item.product.image).toBeDefined();
        expect(item.product.price).toBeDefined();
      });

      // Total should be correctly computed
      const expectedTotal = res.body.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      expect(res.body.total).toBeCloseTo(expectedTotal, 2);
    });

    it('should simulate user incrementing quantity on Cart page', async () => {
      // Cart.jsx calls: updateQuantity(item.id, item.quantity + 1)
      const cartRes = await request(app).get('/api/cart');
      const item = cartRes.body.items[0];
      const originalQty = item.quantity;

      const res = await request(app)
        .put(`/api/cart/${item.id}`)
        .send({ quantity: originalQty + 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.item.quantity).toBe(originalQty + 1);
    });

    it('should simulate user decrementing quantity to 0 (auto-remove)', async () => {
      // Cart.jsx calls: updateQuantity(item.id, 0) when qty goes below 1
      const cartRes = await request(app).get('/api/cart');
      const item = cartRes.body.items[0];

      const res = await request(app).put(`/api/cart/${item.id}`).send({ quantity: 0 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Item removed from cart');
    });

    it('should simulate user clicking Remove button', async () => {
      const cartRes = await request(app).get('/api/cart');
      const item = cartRes.body.items[0];

      const res = await request(app).delete(`/api/cart/${item.id}`);
      expect(res.statusCode).toBe(200);
    });
  });

  // ─────────────────────────────────────────
  // Checkout — Complete Purchase Flow
  // ─────────────────────────────────────────
  describe('Checkout Page — End-to-End Purchase', () => {
    it('should simulate complete shopping journey: browse → add → checkout', async () => {
      // 1. User browses products (Home page)
      const productsRes = await request(app).get('/api/products?featured=true');
      expect(productsRes.statusCode).toBe(200);
      const product1 = productsRes.body[0];
      const product2 = productsRes.body[1];

      // 2. User views product detail
      const detailRes = await request(app).get(`/api/products/${product1.id}`);
      expect(detailRes.statusCode).toBe(200);
      expect(detailRes.body.name).toBe(product1.name);

      // 3. User adds items to cart
      await request(app).post('/api/cart').send({ productId: product1.id, quantity: 1 });
      await request(app).post('/api/cart').send({ productId: product2.id, quantity: 2 });

      // 4. User views cart
      const cartRes = await request(app).get('/api/cart');
      expect(cartRes.body.items.length).toBe(2);
      expect(cartRes.body.total).toBe(
        parseFloat((product1.price * 1 + product2.price * 2).toFixed(2))
      );

      // 5. User fills checkout form and places order
      const orderRes = await request(app).post('/api/orders').send({
        name: 'Jane Smith',
        email: 'jane@shopmart.com',
        address: '456 Oak Ave, Los Angeles, CA 90001',
      });

      expect(orderRes.statusCode).toBe(201);
      expect(orderRes.body.order.customer.name).toBe('Jane Smith');
      expect(orderRes.body.order.items.length).toBe(2);
      expect(orderRes.body.order.status).toBe('confirmed');
      expect(orderRes.body.order.total).toBe(
        parseFloat((product1.price * 1 + product2.price * 2).toFixed(2))
      );

      // 6. Cart should be empty after order
      const emptyCart = await request(app).get('/api/cart');
      expect(emptyCart.body.items.length).toBe(0);
      expect(emptyCart.body.count).toBe(0);

      // 7. Order should appear in order history
      const historyRes = await request(app).get('/api/orders');
      expect(historyRes.body.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────
  // API Contract Validation
  // ─────────────────────────────────────────
  describe('API Contract — Response Shape Validation', () => {
    it('cart response should match CartContext expected shape', async () => {
      const res = await request(app).get('/api/cart');
      // CartContext expects: { items: [], total: number, count: number }
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('count');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(typeof res.body.count).toBe('number');
    });

    it('product response should have image URLs for frontend rendering', async () => {
      const res = await request(app).get('/api/products');
      res.body.forEach((product) => {
        expect(product.image).toMatch(/^https?:\/\//);
      });
    });

    it('order response should have createdAt timestamp', async () => {
      const historyRes = await request(app).get('/api/orders');
      if (historyRes.body.length > 0) {
        expect(historyRes.body[0].createdAt).toBeDefined();
        expect(new Date(historyRes.body[0].createdAt).toString()).not.toBe('Invalid Date');
      }
    });
  });
});
