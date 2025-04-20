import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useUser } from "./UserContext";
import { createOrder } from "../services/api";
import ErrorBoundary from "./ErrorBoundary";

const CartContext = createContext();

const initialState = {
  carts: {},
  initialized: false
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { userId, item } = action.payload; // item should be { menuItemId, name, price, quantity, special_instructions }
      const userCart = state.carts[userId] || [];
      const existingItemIndex = userCart.findIndex(cartItem => cartItem.menuItemId === item.menuItemId);

      let updatedCart;
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        updatedCart = userCart.map((cartItem, index) => 
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity } 
            : cartItem
        );
      } else {
        // Add new item
        updatedCart = [...userCart, item];
      }

      return {
        ...state,
        carts: {
          ...state.carts,
          [userId]: updatedCart
        }
      };
    }
    case "REMOVE_FROM_CART": {
      const { userId, menuItemId } = action.payload; // Changed payload to menuItemId
      const userCart = state.carts[userId] || [];
      return {
        ...state,
        carts: {
          ...state.carts,
          [userId]: userCart.filter(item => item.menuItemId !== menuItemId) // Filter by menuItemId
        }
      };
    }
    case "CLEAR_CART": {
      const { userId } = action.payload;
      return {
        ...state,
        carts: {
          ...state.carts,
          [userId]: []
        }
      };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  useEffect(() => {
    if (!initialState.initialized) {
      initialState.initialized = true;
    }
  }, []);
  const { user } = useUser();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  // Helper to wrap dispatch with userId
  const userId = user?.id || "guest";
  const userCart = state.carts[userId] || [];
  const totalPrice = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const userDispatch = (action) => {
    // Wrap action with userId
    switch (action.type) {
      case "ADD_TO_CART":
        dispatch({ type: "ADD_TO_CART", payload: { userId, item: action.payload } });
        break;
      case "REMOVE_FROM_CART":
        // Expecting payload to be menuItemId
        dispatch({ type: "REMOVE_FROM_CART", payload: { userId, menuItemId: action.payload } });
        break;
      case "CLEAR_CART":
        dispatch({ type: "CLEAR_CART", payload: { userId } });
        break;
      default:
        dispatch(action);
    }
  };
  return (
    <ErrorBoundary>
      <CartContext.Provider value={{ cart: userCart, dispatch: userDispatch, totalPrice }}>
        {children}
      </CartContext.Provider>
    </ErrorBoundary>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

async function placeOrder(cartItems, user) {
  try {
    if (!user?.phone) {
      throw new Error('User phone number is required');
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    // Map cart items to the format expected by the backend
    const orderItems = cartItems.map(item => ({
      menu_item_id: item.menuItemId, // Use menuItemId from cart state
      quantity: item.quantity,
      special_instructions: item.special_instructions || '',
      price: item.price // Include price from cart item
    }));

    const orderData = {
      items: orderItems,
      customer_name: user?.name || 'Guest',
      phone_number: user.phone,
      email: user?.email || '',
      total_amount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    console.log('Sending order data:', orderData);
    const response = await createOrder(orderData);
    return response;
  } catch (error) {
    console.error('Order failed:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data?.message || error.message);
    }
    throw error;
  }
}

export { placeOrder };
