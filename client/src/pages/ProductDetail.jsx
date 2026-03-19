import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct } from '../api';
import { useCart } from '../context/CartContext';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProduct(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader />;
  if (!product)
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <h2>Product not found</h2>
      </div>
    );

  return (
    <div className="page-enter product-detail" id="product-detail-page">
      <div className="container">
        <Link to="/products" className="back-link">
          ← Back to Products
        </Link>

        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <span className="product-detail-category">{product.category}</span>
            <h1 className="product-detail-name">{product.name}</h1>
            <Rating value={product.rating} />
            <p className="product-detail-price gradient-text">${product.price.toFixed(2)}</p>
            <p className="product-detail-desc">{product.description}</p>

            <div className="product-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Availability</span>
                <span className="meta-value in-stock">
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{product.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Rating</span>
                <span className="meta-value">⭐ {product.rating} / 5</span>
              </div>
            </div>

            <div className="product-detail-actions">
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product.id, quantity)}
                id="detail-add-to-cart-btn"
              >
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
