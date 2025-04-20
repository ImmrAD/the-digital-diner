import React, { createContext, useContext, useReducer } from "react";
import { useUser } from "./UserContext";

const CartContext = createContext();

const initialState = {
  carts: {} // { [userId]: [cartItems] }
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { userId, item } = action.payload;
      const userCart = state.carts[userId] || [];
      return {
        ...state,
        carts: {
          ...state.carts,
          [userId]: [...userCart, item]
        }
      };
    }
    case "REMOVE_FROM_CART": {
      const { userId, itemId } = action.payload;
      const userCart = state.carts[userId] || [];
      return {
        ...state,
        carts: {
          ...state.carts,
          [userId]: userCart.filter(item => item.id !== itemId)
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
  const { user } = useUser();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  // Helper to wrap dispatch with userId
  const userId = user?.id || "guest";
  const userCart = state.carts[userId] || [];
  const userDispatch = (action) => {
    // Wrap action with userId
    switch (action.type) {
      case "ADD_TO_CART":
        dispatch({ type: "ADD_TO_CART", payload: { userId, item: action.payload } });
        break;
      case "REMOVE_FROM_CART":
        dispatch({ type: "REMOVE_FROM_CART", payload: { userId, itemId: action.payload } });
        break;
      case "CLEAR_CART":
        dispatch({ type: "CLEAR_CART", payload: { userId } });
        break;
      default:
        dispatch(action);
    }
  };
  return (
    <CartContext.Provider value={{ cart: userCart, dispatch: userDispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
