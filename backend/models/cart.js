const { pool } = require('./order');

// Get cart for a user
const getCartByUserId = async (userId) => {
  const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) {
    return { userId, items: [] };
  }
  const cart = cartResult.rows[0];
  const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);
  return { userId, items: itemsResult.rows };
};

// Add or update item in cart
const addItemToCart = async (userId, menu_item_id, quantity, special_instructions) => {
  let cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  let cartId;
  if (cartResult.rows.length === 0) {
    const newCart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
    cartId = newCart.rows[0].id;
  } else {
    cartId = cartResult.rows[0].id;
  }
  const existingItem = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2', [cartId, menu_item_id]);
  if (existingItem.rows.length > 0) {
    await pool.query('UPDATE cart_items SET quantity = quantity + $1, special_instructions = $2 WHERE cart_id = $3 AND menu_item_id = $4', [quantity, special_instructions || existingItem.rows[0].special_instructions, cartId, menu_item_id]);
  } else {
    await pool.query('INSERT INTO cart_items (cart_id, menu_item_id, quantity, special_instructions) VALUES ($1, $2, $3, $4)', [cartId, menu_item_id, quantity, special_instructions]);
  }
  const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
  return { userId, items: itemsResult.rows };
};

// Update item quantity or special instructions
const updateCartItem = async (userId, menu_item_id, quantity, special_instructions) => {
  const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) return null;
  const cartId = cartResult.rows[0].id;
  await pool.query('UPDATE cart_items SET quantity = $1, special_instructions = $2 WHERE cart_id = $3 AND menu_item_id = $4', [quantity, special_instructions, cartId, menu_item_id]);
  const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
  return { userId, items: itemsResult.rows };
};

// Remove item from cart
const removeItemFromCart = async (userId, menu_item_id) => {
  const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) return null;
  const cartId = cartResult.rows[0].id;
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2', [cartId, menu_item_id]);
  const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
  return { userId, items: itemsResult.rows };
};

// Clear cart
const clearCart = async (userId) => {
  const cartResult = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) return null;
  const cartId = cartResult.rows[0].id;
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  return { userId, items: [] };
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
};