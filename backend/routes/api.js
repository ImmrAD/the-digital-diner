const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menuItem');
const pool = require('../models/order');

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
      const menuItem = menuItems.find(m => m._id.toString() === item.menu_item_id);
      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price, special_instructions) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.menu_item_id, item.quantity, menuItem.price, item.special_instructions]
      );
    }
    
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get orders by phone number
router.get('/orders/:phone', async (req, res) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE phone_number = $1 ORDER BY order_date DESC',
      [req.params.phone]
    );
    
    if (orders.rows.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
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

module.exports = router;