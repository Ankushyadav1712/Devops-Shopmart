import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';

const categories = [
  { name: 'Electronics', icon: '⚡', count: '4 Products' },
  { name: 'Clothing', icon: '👕', count: '4 Products' },
  { name: 'Home & Kitchen', icon: '🏠', count: '3 Products' },
  { name: 'Books', icon: '📚', count: '1 Product' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await fetchProducts({ featured: true });
        setFeatured(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="page-enter" id="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Discover <span className="gradient-text">Premium</span> Products for Every Lifestyle
              </h1>
              <p>
                Shop the latest trends in electronics, fashion, home essentials, and more. 
                Curated collections with unbeatable quality and prices.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary" id="hero-shop-now-btn">
                  Shop Now →
                </Link>
                <Link to="/products?category=Electronics" className="btn btn-outline">
                  Browse Electronics
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <h3 className="gradient-text">12+</h3>
                  <p>Premium Products</p>
                </div>
                <div className="stat-item">
                  <h3 className="gradient-text">4</h3>
                  <p>Categories</p>
                </div>
                <div className="stat-item">
                  <h3 className="gradient-text">24/7</h3>
                  <p>Support</p>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-card">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" 
                  alt="ShopMart Collection"
                />
                <div className="hero-float-tag" style={{ top: '20px', right: '-20px' }}>
                  ✓ Free Shipping
                </div>
                <div className="hero-float-tag" style={{ bottom: '40px', left: '-30px' }}>
                  ⭐ Top Rated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products">View All →</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.name}`} key={cat.name} className="category-card" id={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products">View All →</Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="products-grid">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2>Why ShopMart?</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free delivery on all orders over $50. Fast and reliable shipping worldwide.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day hassle-free return policy. No questions asked.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>Your data is protected with industry-standard encryption.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
