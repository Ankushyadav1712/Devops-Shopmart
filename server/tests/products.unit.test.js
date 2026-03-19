/**
 * Unit Tests: Products Data Module
 *
 * Tests the products data store in isolation.
 * Validates data integrity, structure, and constraints
 * for each individual product record.
 */
const products = require('../data/products');

describe('📦 Products Data Module — Unit Tests', () => {
  // ─────────────────────────────────────────
  // Data Structure
  // ─────────────────────────────────────────
  describe('Data Structure', () => {
    it('should export an array', () => {
      expect(Array.isArray(products)).toBe(true);
    });

    it('should contain 12 products', () => {
      expect(products.length).toBe(12);
    });

    it('each product should have required fields', () => {
      const requiredFields = [
        'id',
        'name',
        'price',
        'description',
        'image',
        'category',
        'rating',
        'stock',
      ];
      products.forEach((product) => {
        requiredFields.forEach((field) => {
          expect(product).toHaveProperty(field);
        });
      });
    });
  });

  // ─────────────────────────────────────────
  // ID Validation
  // ─────────────────────────────────────────
  describe('Product IDs', () => {
    it('all IDs should be unique', () => {
      const ids = products.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all IDs should be positive integers', () => {
      products.forEach((product) => {
        expect(Number.isInteger(product.id)).toBe(true);
        expect(product.id).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────
  // Field Types & Constraints
  // ─────────────────────────────────────────
  describe('Field Types & Constraints', () => {
    it('names should be non-empty strings', () => {
      products.forEach((product) => {
        expect(typeof product.name).toBe('string');
        expect(product.name.length).toBeGreaterThan(0);
      });
    });

    it('prices should be positive numbers', () => {
      products.forEach((product) => {
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
      });
    });

    it('prices should have at most 2 decimal places', () => {
      products.forEach((product) => {
        const decimals = (product.price.toString().split('.')[1] || '').length;
        expect(decimals).toBeLessThanOrEqual(2);
      });
    });

    it('descriptions should be non-empty strings', () => {
      products.forEach((product) => {
        expect(typeof product.description).toBe('string');
        expect(product.description.length).toBeGreaterThan(10);
      });
    });

    it('images should be valid URLs', () => {
      products.forEach((product) => {
        expect(product.image).toMatch(/^https?:\/\//);
      });
    });

    it('ratings should be between 0 and 5', () => {
      products.forEach((product) => {
        expect(product.rating).toBeGreaterThanOrEqual(0);
        expect(product.rating).toBeLessThanOrEqual(5);
      });
    });

    it('stock should be non-negative integers', () => {
      products.forEach((product) => {
        expect(Number.isInteger(product.stock)).toBe(true);
        expect(product.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ─────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────
  describe('Categories', () => {
    const validCategories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books'];

    it('all products should have a valid category', () => {
      products.forEach((product) => {
        expect(validCategories).toContain(product.category);
      });
    });

    it('each category should have at least 1 product', () => {
      validCategories.forEach((category) => {
        const count = products.filter((p) => p.category === category).length;
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────
  // Featured Products
  // ─────────────────────────────────────────
  describe('Featured Products', () => {
    it('featured field should be boolean when present', () => {
      products.forEach((product) => {
        if (product.featured !== undefined) {
          expect(typeof product.featured).toBe('boolean');
        }
      });
    });

    it('should have at least 1 featured product', () => {
      const featured = products.filter((p) => p.featured);
      expect(featured.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────
  // Individual Product Lookups
  // ─────────────────────────────────────────
  describe('Individual Product Lookups', () => {
    it('should find product by ID using Array.find', () => {
      const product = products.find((p) => p.id === 1);
      expect(product).toBeDefined();
      expect(product.name).toBe('Wireless Noise-Cancelling Headphones');
    });

    it('should return undefined for non-existent ID', () => {
      const product = products.find((p) => p.id === 999);
      expect(product).toBeUndefined();
    });

    it('should filter products by category correctly', () => {
      const electronics = products.filter((p) => p.category === 'Electronics');
      electronics.forEach((p) => {
        expect(p.category).toBe('Electronics');
      });
    });

    it('should filter products by search keyword', () => {
      const keyword = 'headphones';
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)
      );
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
