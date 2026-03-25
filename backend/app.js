// ==========================================
// app.js — Express app factory (no listen call)
// Separated from server.js so tests can import the app
// without starting the server or connecting to a real DB.
//
// server.js imports this and calls app.listen().
// tests/auth.test.js imports this and uses supertest.
// ==========================================

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

// ---- Middleware ----
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Routes ----
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// ---- Health check ----
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date() })
);

// ---- Global error handler ----
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
