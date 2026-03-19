import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Products.css';

const allCategories = ['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Books'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory !== 'All') params.category = activeCategory;
        if (search) params.search = search;
        const { data } = await fetchProducts(params);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadProducts, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="page-enter products-page" id="products-page">
      <div className="container">
        <div className="products-page-header">
          <h1>Our Products</h1>
          <p>Discover our curated collection of premium products</p>
        </div>

        <div className="products-toolbar">
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="product-search-input"
            />
          </div>
          <div className="filter-buttons">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
                id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="products-count">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
