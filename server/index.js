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
const normalizeOrigin = (value) => value.trim().replace(/\/$/, '');

const getRequestOrigin = (req) => {
  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost || req.get('host');
  const protocol = forwardedProto || req.protocol;

  if (!host || !protocol) return '';

  return normalizeOrigin(`${protocol}://${host}`);
};

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);

const renderOrigins = [
  process.env.RENDER_EXTERNAL_URL,
  process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '',
  process.env.RENDER_SERVICE_NAME ? `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : '',
]
  .map((value) => value && normalizeOrigin(value))
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  ...envOrigins,
  ...renderOrigins,
].filter(Boolean));

app.use(cors((req, callback) => {
  const origin = req.get('origin');

  if (!origin) {
    return callback(null, { origin: true, credentials: true });
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const requestOrigin = getRequestOrigin(req);
  const isAllowed = allowedOrigins.has(normalizedOrigin) || normalizedOrigin === requestOrigin;

  return callback(null, {
    origin: isAllowed,
    credentials: true,
  });
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
