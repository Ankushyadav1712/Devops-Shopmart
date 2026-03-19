import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, removeCartItem as apiRemoveCartItem } from '../api';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  count: 0,
  loading: false,
  toast: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        count: action.payload.count,
        loading: false,
      };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, count: 0, loading: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data } = await fetchCart();
      dispatch({ type: 'SET_CART', payload: data });
    } catch (err) {
      console.error('Failed to load cart:', err);
      dispatch({ type: 'SET_CART', payload: { items: [], total: 0, count: 0 } });
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const showToast = (message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await apiAddToCart(productId, quantity);
      await loadCart();
      showToast('Added to cart!');
    } catch (err) {
      showToast('Failed to add item', 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
      await loadCart();
    } catch (err) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiRemoveCartItem(itemId);
      await loadCart();
      showToast('Item removed');
    } catch (err) {
      showToast('Failed to remove item', 'error');
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
