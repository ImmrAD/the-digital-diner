import axios from 'axios';

const API = axios.create({
  baseURL: 'https://the-digital-diner.pages.dev/api',
  withCredentials: true
});

export const getMenuItems = async () => {
  try {
    const response = await API.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

export const getMenuItemsByCategory = async (category) => {
  try {
    const response = await API.get(`/menu/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} items:`, error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await API.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrdersByPhone = async (phone) => {
  try {
    // Use encodeURIComponent to properly format the phone number in the URL
    const encodedPhone = encodeURIComponent(phone);
    const response = await API.get(`/orders/phone/${encodedPhone}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await API.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};