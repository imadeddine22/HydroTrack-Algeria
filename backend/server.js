require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const compression = require('compression');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const seed       = require('./seed');

// ── Environment Validation ──────────────────────────────────────────────────
const requiredEnv = ['MONGODB_URI', 'ADMIN_API_KEY'];
const missingEnv = requiredEnv.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌  Missing environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// ── Routes ──────────────────────────────────────────────────────────────────
const wilayasRouter         = require('./routes/wilayas');
const communesRouter        = require('./routes/communes');
const zonesRouter           = require('./routes/zones');
const infrastructuresRouter = require('./routes/infrastructures');
const readingsRouter        = require('./routes/readings');
const alertsRouter          = require('./routes/alerts');
const messagesRouter        = require('./routes/messages');
const wilayaInfraRouter     = require('./routes/wilaya-infra');

// ── App setup ───────────────────────────────────────────────────────────────
const app  = express();
app.set('trust proxy', 1); // Trust first proxy (e.g. Nginx, Heroku)
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ── Security & Performance Middleware ────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('combined')); // Production-ready logging

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ 
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Auth Middleware ─────────────────────────────────────────────────────────
// Defined public GET routes that don't need the API key
const PUBLIC_GET_ROUTES = [
  '/api/wilayas',
  '/api/communes',
  '/api/zones',
  '/api/infrastructures',
  '/api/wilaya-infra',
  '/health'
];

const auth = (req, res, next) => {
  // 1. Allow public GET routes
  const isPublicGet = req.method === 'GET' && PUBLIC_GET_ROUTES.some(path => req.originalUrl.startsWith(path));
  
  // 2. Allow POST to messages (contact form)
  const isPublicPost = req.method === 'POST' && req.originalUrl.startsWith('/api/messages');

  if (isPublicGet || isPublicPost) return next();

  // 3. Check API Key
  const key = req.headers['authorization'] || req.headers['x-api-key'];
  if (key && key === process.env.ADMIN_API_KEY) return next();

  res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
};

// ── API Routes ───────────────────────────────────────────────────────────────
// Apply auth middleware to all /api routes except health
app.use('/api/wilayas',         auth, wilayasRouter);
app.use('/api/communes',        auth, communesRouter);
app.use('/api/zones',           auth, zonesRouter);
app.use('/api/infrastructures', auth, infrastructuresRouter);
app.use('/api/readings',        auth, readingsRouter);
app.use('/api/alerts',          auth, alertsRouter);
app.use('/api/messages',        auth, messagesRouter);
app.use('/api/wilaya-infra',    auth, wilayaInfraRouter);

// ── Seed route (Protected) ───────────────────────────────────────────────────
app.get('/api/seed', auth, async (_req, res) => {
  try {
    await seed(MONGODB_URI);
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    server: 'HydroTrack Algeria Backend',
    version: '1.0.0',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}\n${err.stack}`);
  const status = err.status || 500;
  res.status(status).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// ── Connect DB & Start ────────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║   🌊  HydroTrack Algeria  –  Backend     ║
╠══════════════════════════════════════════╣
║   Server  :  http://localhost:${PORT}         ║
║   Health  :  http://localhost:${PORT}/health  ║
╚══════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
