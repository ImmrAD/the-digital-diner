import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ handleLogout }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white bg-opacity-500 backdrop-filter backdrop-blur-lg border-b border-black neon-border">
      <h1 className="text-2xl font-mono font-bold text-black">
          <span>The Digital Diner</span>
      </h1>
      <nav className="space-x-4">
        <Link to="/" className="text-black hover:text-cyan-300">Home</Link>
        <Link to="/menu" className="text-black hover:text-cyan-300">Menu</Link>
        <Link to="/order-history" className="text-black hover:text-cyan-300">History</Link> 
        <Link to="/cart-view" className="text-black hover:text-cyan-300">Cart</Link>
        <button onClick={handleLogout} className="text-black hover:text-cyan-300">Logout</button>
      </nav>
    </div>
  );
};

export default NavBar;
