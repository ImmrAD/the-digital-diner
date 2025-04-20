import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useUser } from '../components/UserContext';
import { placeOrder } from '../components/CartContext';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { cart: cartItems = [], totalPrice } = useCart();
  const { user } = useUser();

  const { dispatch } = useCart();

  const handlePlaceOrder = async () => {
    try {
      if (!user?.phone) {
        alert('Please log in to place an order');
        navigate('/login');
        return;
      }
      if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      const result = await placeOrder(cartItems, user);
      if (result?.id) {
        dispatch({ type: 'CLEAR_CART' });
        alert('Order placed successfully!');
        navigate('/order-history');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || error.message || 'Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Place Order</h1>
      {cartItems.length > 0 ? (
        <div>
          <div className="mb-6">
            {cartItems.map((item, index) => (
              <div key={index} className="mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span className="ml-4">${item.price * item.quantity}</span>
              </div>
            ))}
            <div className="mt-4 text-xl font-bold">
              Total: ${totalPrice}
            </div>
          </div>
          <button 
            onClick={handlePlaceOrder}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Confirm Order
          </button>
        </div>
      ) : (
        <p>Your cart is empty</p>
      )}
    </div>
  );
}