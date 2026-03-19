import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Product APIs
export const fetchProducts = (params = {}) => API.get('/products', { params });
export const fetchProduct = (id) => API.get(`/products/${id}`);

// Cart APIs
export const fetchCart = () => API.get('/cart');
export const addToCart = (productId, quantity = 1) => API.post('/cart', { productId, quantity });
export const updateCartItem = (id, quantity) => API.put(`/cart/${id}`, { quantity });
export const removeCartItem = (id) => API.delete(`/cart/${id}`);

// Order APIs
export const placeOrder = (orderData) => API.post('/orders', orderData);
export const fetchOrders = () => API.get('/orders');

export default API;
