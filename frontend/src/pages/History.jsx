import React, { useEffect, useState } from 'react';
import { getOrdersByPhone } from '../services/api';
import { useUser } from '../components/UserContext';

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Current user:', user);
        
        // Check if user exists and has phone number
        if (!user) {
          setError('Please log in to view your order history');
          return;
        }
        
        // The API response might include phone_number instead of phone
        const phoneNumber = user.phone || user.phone_number || user.id;
        console.log('Using phone number:', phoneNumber);
        
        if (!phoneNumber) {
          console.error('No phone number found in user object:', user);
          setError('User phone number not found. Please try logging in again.');
          return;
        }
        
        try {
          const response = await getOrdersByPhone(phoneNumber);
          setOrders(response);
        } catch (apiError) {
          console.error('API error fetching orders:', apiError);
          setError('Failed to load order history. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response error data:', error.response.data);
          console.error('Response error status:', error.response.status);
          setError(`Error ${error.response.status}: ${error.response.data.message || 'Failed to load order history'}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request error:', error.request);
          setError('No response from server. Please check your connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('Failed to load order history. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div>
      <h1>Order History</h1>
      {loading ? (
        <p>Loading your order history...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li key={index} className="border p-4 rounded shadow">
              <div className="font-bold">Order #{index + 1}</div>
              <div>Date: {new Date(order.order_date).toLocaleString()}</div>
              <div>Items: {order.items.length}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
}