import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛒</span>
          <span className="gradient-text">ShopMart</span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink>
          <button className="cart-icon" onClick={() => { navigate('/cart'); setMenuOpen(false); }} id="cart-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.77 2.34-1.867l1.555-6.843c.166-.736-.38-1.415-1.14-1.415H5.685m1.828 10.125a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
            Cart
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
