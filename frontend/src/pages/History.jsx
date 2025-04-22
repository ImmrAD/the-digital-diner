import React, { useEffect, useState } from 'react';
import { getOrdersByPhone, getMenuItems } from '../services/api';
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
          
          // Fetch menu item details for each order item
          try {
            // Get all menu items from API
            const menuItems = await getMenuItems();
            
            // Map menu item details to order items
            const ordersWithItemDetails = response.map(order => {
              if (order.items && order.items.length > 0) {
                const itemsWithDetails = order.items.map(item => {
                  const menuItem = menuItems.find(mi => mi._id === item.menu_item_id);
                  return {
                    ...item,
                    name: menuItem ? menuItem.name : 'Unknown Item',
                    description: menuItem ? menuItem.description : '',
                    // Keep the original price from the order in case it changed
                  };
                });
                
                return { ...order, items: itemsWithDetails };
              }
              return order;
            });
            
            setOrders(ordersWithItemDetails);
          } catch (menuError) {
            console.error('Error fetching menu items:', menuError);
            // Still set orders even if menu items fetch fails
            setOrders(response);
          }
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

  // Function to format currency in Indian Rupees
  const formatCurrency = (amount) => {
    // Check if amount is a valid number before formatting
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      return '₹0.00';
    }
    // Ensure amount is treated as a number by explicitly parsing it
    // This handles cases where amount might be a string from the API
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      {loading ? (
        <p className="text-gray-600">Loading your order history...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order, index) => (
            <div key={order.id || index} className="border p-6 rounded-lg shadow-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order #{order.id || index + 1}</h2>
                <span className="text-gray-600">{new Date(order.order_date).toLocaleString()}</span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700"><span className="font-semibold">Status:</span> {order.status || 'Processing'}</p>
                <p className="text-gray-700"><span className="font-semibold">Customer:</span> {order.customer_name}</p>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <h3 className="font-semibold mb-3">Order Items:</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b last:border-b-0">
                        <td className="py-2">
                          <div className="font-medium">{item.name || 'Unknown Item'}</div>
                          {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                          {item.special_instructions && (
                            <div className="text-xs italic mt-1">Note: {item.special_instructions}</div>
                          )}
                        </td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Total amount section removed as requested */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No orders found</p>
      )}
    </div>
  );
}