const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menuItem');
const { pool } = require('../config/db');
const { authenticateUser } = require('../models/order');
const { registerUser } = require('../models/user');


// Get all menu items
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ active: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get menu items by category
router.get('/menu/:category', async (req, res) => {
  try {
    const items = await MenuItem.find({ 
      category: req.params.category,
      active: true 
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order
router.post('/orders', async (req, res) => {
  const { customer_name, phone_number, email, items } = req.body;
  
  try {
    // Calculate total
    const menuItems = await MenuItem.find({ 
      _id: { $in: items.map(i => i.menu_item_id) } 
    });
    
    const total = items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m._id.toString() === item.menu_item_id);
      return sum + (menuItem.price * item.quantity);
    }, 0);
    
    // Create order in PostgreSQL
    const orderResult = await pool.query(
      'INSERT INTO orders (customer_name, phone_number, email, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_name, phone_number, email, total]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Add order items
    for (const item of items) {
      // Use the price from the request payload instead of looking it up from the menu item
      // This handles cases where the price might vary based on size selection
      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price, special_instructions) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.menu_item_id, item.quantity, item.price, item.special_instructions]
      );
    }
    
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get orders by phone number
router.get('/orders/phone/:phone', async (req, res) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE phone_number = $1 ORDER BY order_date DESC',
      [req.params.phone]
    );
    
    // Return empty array instead of 404 when no orders found
    if (orders.rows.length === 0) {
      return res.json([]);
    }
    
    // Get order items for each order
    for (const order of orders.rows) {
      const items = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = items.rows;
    }
    
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User registration
router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body;
  
  try {
    // Basic field validation
    const errors = [];
    if (!name) errors.push('Name is required');
    if (!phone) errors.push('Phone number is required');
    if (!password) errors.push('Password is required');
    
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Additional validation before registration
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const user = await registerUser(name, phone, email, password);
    res.status(201).json({ id: user.id, name: user.name });
  } catch (err) {
    // Handle specific database errors
    if (err.message.includes('Phone number already registered')) {
      return res.status(400).json({ message: 'This phone number is already registered' });
    }
    if (err.message.includes('Email already registered')) {
      return res.status(400).json({ message: 'This email is already registered' });
    }
    res.status(400).json({ message: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  
  try {
    const user = await authenticateUser(phone, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ id: user.id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new menu item
router.post('/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- User Cart Endpoints (PostgreSQL) ---
// Get cart for a user
router.get('/cart/:userId', async (req, res) => {
  try {
    const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [req.params.userId]);
    if (cartResult.rows.length === 0) {
      return res.json({ userId: req.params.userId, items: [] });
    }
    const cart = cartResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.json({ userId: req.params.userId, items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add item to cart
router.post('/cart/:userId/add', async (req, res) => {
  const { menu_item_id, quantity, special_instructions } = req.body;
  try {
    let cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [req.params.userId]);
    let cartId;
    if (cartResult.rows.length === 0) {
      const newCart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.params.userId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    // Check if item already exists in cart
    const existingItem = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2', [cartId, menu_item_id]);
    if (existingItem.rows.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = quantity + $1, special_instructions = $2 WHERE cart_id = $3 AND menu_item_id = $4', [quantity, special_instructions || existingItem.rows[0].special_instructions, cartId, menu_item_id]);
    } else {
      await pool.query('INSERT INTO cart_items (cart_id, menu_item_id, quantity, special_instructions) VALUES ($1, $2, $3, $4)', [cartId, menu_item_id, quantity, special_instructions]);
    }
    const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ userId: req.params.userId, items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Remove item from cart
router.post('/cart/:userId/remove', async (req, res) => {
  const { menu_item_id } = req.body;
  try {
    const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [req.params.userId]);
    if (cartResult.rows.length === 0) return res.status(404).json({ message: 'Cart not found' });
    const cartId = cartResult.rows[0].id;
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2', [cartId, menu_item_id]);
    const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ userId: req.params.userId, items: itemsResult.rows });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Clear cart
router.post('/cart/:userId/clear', async (req, res) => {
  try {
    const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [req.params.userId]);
    if (cartResult.rows.length === 0) return res.status(404).json({ message: 'Cart not found' });
    const cartId = cartResult.rows[0].id;
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ userId: req.params.userId, items: [] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;