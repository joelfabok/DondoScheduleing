require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const eventRoutes = require('./routes/events');
const followupRoutes = require('./routes/followups');
const helperRoutes = require('./routes/helpers');
const userRoutes = require('./routes/users');

const app = express();

app.use(express.json({ limit: '1mb' }));

// ── Middleware ──────────────────────────────────────────────────
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...envOrigins,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve client app when deployed as a single web service.
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../client/dist');

  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
    fallthrough: false,
    immutable: true,
    maxAge: '1y',
  }));

  app.use(express.static(clientDistPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
  }));

  app.use('/assets', (err, req, res, next) => {
    if (err) {
      return res.status(404).json({ message: 'Static asset not found' });
    }
    return next();
  });

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ── Database + Start ────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
