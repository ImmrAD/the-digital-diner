const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});

const SALT_ROUNDS = 10;

const createCartTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) UNIQUE NOT NULL
    )
  `);
};

const createCartItemTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
      menu_item_id VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      special_instructions TEXT
    )
  `);
};

const createOrderTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'pending',
      total_amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const createOrderItemTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      menu_item_id VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      special_instructions TEXT
    )
  `);
};

const createUserTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const initializeTables = async () => {
  await createUserTable();
  await createCartTable();
  await createCartItemTable();
  await createOrderTable();
  await createOrderItemTable();
};

initializeTables();

const registerUser = async (name, phone, email, password) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    'INSERT INTO users (name, phone_number, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, phone, email, hashedPassword]
  );
  return result.rows[0];
};

const authenticateUser = async (phone, password) => {
  if (!phone || !password) {
    throw new Error('Phone number and password are required');
  }

  // Validate phone number format
  if (!/^\d{10}$/.test(phone)) {
    throw new Error('Invalid phone number format');
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }

    // Return user data without sensitive information
    const { password_hash, ...userData } = user;
    return userData;
  } catch (err) {
    throw new Error('Authentication failed');
  }
};

module.exports = {
  pool,
  registerUser,
  authenticateUser
};