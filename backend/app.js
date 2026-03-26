const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (Postman, curl)
    if (!origin) return callback(null, true);

    // Allow localhost (development)
    if (origin.includes('localhost')) return callback(null, true);

    // Allow ANY vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Allow ANY onrender.com subdomain
    if (origin.endsWith('.onrender.com')) return callback(null, true);

    // Allow custom domain from env variable
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth',  require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date() })
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;