import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Rating from './Rating';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <Link to={`/products/${product.id}`}>
        <div className="product-card-image">
          <img src={product.image} alt={product.name} loading="lazy" />
          <span className="product-card-category">{product.category}</span>
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <Rating value={product.rating} />
        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          <button
            className="product-card-add"
            onClick={handleAdd}
            title="Add to cart"
            id={`add-to-cart-${product.id}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
