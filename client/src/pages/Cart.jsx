import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import './Cart.css';

export default function Cart() {
  const { items, total, count, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <Loader />;

  return (
    <div className="page-enter cart-page" id="cart-page">
      <div className="container">
        <h1>
          Shopping Cart{' '}
          {count > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>({count} items)</span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary" id="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id} id={`cart-item-${item.id}`}>
                  <div className="cart-item-image">
                    <Link to={`/products/${item.productId}`}>
                      <img src={item.product?.image} alt={item.product?.name} />
                    </Link>
                  </div>
                  <div className="cart-item-info">
                    <Link to={`/products/${item.productId}`} className="cart-item-name">
                      {item.product?.name}
                    </Link>
                    <span className="cart-item-price">${item.product?.price.toFixed(2)} each</span>
                    <div className="cart-item-controls">
                      <div className="cart-qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="cart-item-subtotal gradient-text">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--success)' }}>{total >= 50 ? 'Free' : '$9.99'}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${(total + (total < 50 ? 9.99 : 0) + total * 0.08).toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
                id="checkout-btn"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
