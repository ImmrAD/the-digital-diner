const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;

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

const registerUser = async (name, phone, email, password) => {
  // Validate phone number format (10 digits)
  if (!/^\d{10}$/.test(phone)) {
    throw new Error('Phone number must be 10 digits');
  }

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password length
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  try {
    const result = await pool.query(
      'INSERT INTO users (name, phone_number, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, email, hashedPassword]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      if (err.constraint.includes('phone_number')) {
        throw new Error('Phone number already registered');
      } else if (err.constraint.includes('email')) {
        throw new Error('Email already registered');
      }
    }
    throw err;
  }
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
  registerUser,
  authenticateUser
};