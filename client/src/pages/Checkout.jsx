import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api';
import './Checkout.css';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await placeOrder({
        name: formData.name,
        email: formData.email,
        address: `${formData.address}, ${formData.city} ${formData.zip}`,
      });
      setOrder(data.order);
      clearCart();
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="page-enter checkout-page" id="checkout-success">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with ShopMart</p>
            <div className="order-id">Order #{order.id}</div>
            <br />
            <br />
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-enter checkout-page">
        <div className="container">
          <div className="order-success">
            <h2>No items to checkout</h2>
            <p>Add some items to your cart first.</p>
            <br />
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="page-enter checkout-page" id="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Shipping Information</h2>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="checkout-name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="checkout-email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                name="address"
                id="checkout-address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  name="city"
                  id="checkout-city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="zip">ZIP Code</label>
                <input
                  type="text"
                  name="zip"
                  id="checkout-zip"
                  placeholder="10001"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="place-order-btn"
              disabled={submitting}
              id="place-order-btn"
            >
              {submitting ? 'Placing Order...' : `Place Order — $${grandTotal.toFixed(2)}`}
            </button>
          </form>

          <div className="checkout-order-summary">
            <h2>Your Order ({items.length} items)</h2>
            <div className="checkout-items">
              {items.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-img">
                    <img src={item.product?.image} alt={item.product?.name} />
                  </div>
                  <div className="checkout-item-details">
                    <h4>{item.product?.name}</h4>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
