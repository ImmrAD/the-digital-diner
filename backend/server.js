const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://cosmic-duckanoo-de9110.netlify.app',
  'https://the-digital-diner.pages.dev',
  'https://the-digital-diner.vercel.app' // ✅ THIS IS CRITICAL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// PostgreSQL connection
const { pool } = require('./config/db');
pool.connect()
  .then(() => console.log('Connected to PostgreSQL via node-postgres'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// API Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => {
  res.send('🍽️ Digital Diner Backend is live!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
