import { useCart } from '../context/CartContext';
import './Toast.css';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
        {toast.message}
      </div>
    </div>
  );
}
