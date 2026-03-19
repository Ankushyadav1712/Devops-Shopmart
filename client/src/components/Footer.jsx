import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="gradient-text">ShopMart</h3>
            <p>
              Your one-stop destination for premium products at unbeatable prices. Quality meets
              convenience.
            </p>
          </div>
          <div className="footer-section">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Clothing">Clothing</Link>
            <Link to="/products?category=Home & Kitchen">Home & Kitchen</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ShopMart. All rights reserved.</span>
          <span>Made with ❤️ for great shopping</span>
        </div>
      </div>
    </footer>
  );
}
