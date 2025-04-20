// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import History from './pages/History';
import NavBar from './components/Navbar';
import MenuItems from './components/MenuItems';
import Login from './pages/Login';
import Register from './pages/Register';
import { UserProvider, useUser } from './components/UserContext';
import { CartProvider } from './components/CartContext';

function AppContent() {
  const { user, setUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  
  // Update authentication state when user changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);
  
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NavBar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        {isAuthenticated ? (
          <>
            <Route path="/menu" element={<MenuItems />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart-view" element={<Cart />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/history" element={<History />} />
            <Route path="/order-history" element={<History />} />
          </>
        ) : null}
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserProvider>
  );
}
