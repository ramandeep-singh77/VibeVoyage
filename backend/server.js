const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const itineraryRoutes = require('./routes/itinerary');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vercel compatibility
}));

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://vibevoyage.vercel.app',
    'https://vibe-voyage.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - more lenient for serverless
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database (with error handling for serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.USE_MEMORY_DB) {
  connectDB().catch(err => {
    console.warn('Database connection failed, using memory storage:', err.message);
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'VibeVoyage Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VibeVoyage API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generateItinerary: '/api/itinerary/generate',
      regenerateDay: '/api/itinerary/regenerate-day',
      destinationSuggestions: '/api/itinerary/destination-suggestions',
      getItinerary: '/api/itinerary/:id'
    }
  });
});

// API routes
app.use('/api/itinerary', itineraryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 VibeVoyage Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;