/**
 * Mock API Layer
 *
 * Replaces axios HTTP calls with in-memory operations using static data.
 * All functions return { data: ... } to match the axios response shape,
 * so no component changes are needed.
 *
 * Cart and orders are stored in memory and reset on page refresh.
 */
import products from './mockData';

// ─── In-memory stores ──────────────────────────────
let cart = []; // Array of { id, product, quantity }
const orders = [];
let nextCartId = 1;
let nextOrderId = 1;

// Small delay to simulate network latency (keeps loading states visible)
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Product APIs ──────────────────────────────────

export const fetchProducts = async (params = {}) => {
  await delay();
  let filtered = [...products];

  if (params.category) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
  }

  if (params.search) {
    const keyword = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)
    );
  }

  if (params.featured === true || params.featured === 'true') {
    filtered = filtered.filter((p) => p.featured);
  }

  return { data: filtered };
};

export const fetchProduct = async (id) => {
  await delay();
  const product = products.find((p) => p.id === Number(id));
  if (!product) throw new Error('Product not found');
  return { data: product };
};

// ─── Cart APIs ─────────────────────────────────────

const computeCartSummary = () => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { items: cart, total, count };
};

export const fetchCart = async () => {
  await delay(50);
  return { data: computeCartSummary() };
};

export const addToCart = async (productId, quantity = 1) => {
  await delay(100);
  const product = products.find((p) => p.id === Number(productId));
  if (!product) throw new Error('Product not found');

  const existing = cart.find((item) => item.product.id === Number(productId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: nextCartId++, product, quantity });
  }

  return { data: computeCartSummary() };
};

export const updateCartItem = async (id, quantity) => {
  await delay(100);
  const item = cart.find((item) => item.id === Number(id));
  if (!item) throw new Error('Cart item not found');

  if (quantity <= 0) {
    cart = cart.filter((item) => item.id !== Number(id));
  } else {
    item.quantity = quantity;
  }

  return { data: computeCartSummary() };
};

export const removeCartItem = async (id) => {
  await delay(100);
  cart = cart.filter((item) => item.id !== Number(id));
  return { data: computeCartSummary() };
};

// ─── Order APIs ────────────────────────────────────

export const placeOrder = async (orderData) => {
  await delay(300);
  const order = {
    id: `ORD-${String(nextOrderId++).padStart(4, '0')}`,
    ...orderData,
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  cart = [];
  nextCartId = 1;
  return { data: { order } };
};

export const fetchOrders = async () => {
  await delay();
  return { data: orders };
};
