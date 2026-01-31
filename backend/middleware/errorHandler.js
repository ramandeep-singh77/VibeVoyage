/**
 * Global error handling middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // AI Service errors
  if (err.name === 'AIServiceError') {
    const message = 'AI service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // Route optimization errors
  if (err.name === 'RouteOptimizationError') {
    const message = 'Unable to optimize route, using default order';
    error = { message, statusCode: 200, warning: true };
  }

  // Budget calculation errors
  if (err.name === 'BudgetCalculationError') {
    const message = 'Budget calculation failed, using estimates';
    error = { message, statusCode: 200, warning: true };
  }

  const statusCode = error.statusCode || 500;
  const isWarning = error.warning || false;

  const response = {
    success: !isWarning && statusCode < 400,
    message: error.message || 'Server Error',
    ...(isWarning && { warning: true }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  // Log different types of errors differently
  if (statusCode >= 500) {
    console.error('🔥 Server Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else if (statusCode >= 400) {
    console.warn('⚠️  Client Error:', {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }

  res.status(statusCode).json(response);
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Log requests in development
 */
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 ${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * Handle specific service errors
 */
const handleServiceError = (serviceName, error) => {
  console.error(`❌ ${serviceName} Error:`, error.message);
  
  const serviceErrors = {
    'AI': {
      message: 'AI service is temporarily unavailable. Please try again later.',
      statusCode: 503,
      fallback: true
    },
    'Route': {
      message: 'Route optimization failed. Using default order.',
      statusCode: 200,
      warning: true
    },
    'Budget': {
      message: 'Budget calculation encountered an issue. Using estimates.',
      statusCode: 200,
      warning: true
    },
    'Database': {
      message: 'Database connection issue. Using temporary storage.',
      statusCode: 200,
      warning: true
    }
  };

  return serviceErrors[serviceName] || {
    message: 'Service temporarily unavailable',
    statusCode: 503
  };
};

/**
 * Validate environment variables
 */
const validateEnvironment = () => {
  const required = ['NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }

  // Set defaults for development
  if (process.env.NODE_ENV === 'development') {
    process.env.USE_MEMORY_DB = process.env.USE_MEMORY_DB || 'true';
  }
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFound,
  requestLogger,
  securityHeaders,
  handleServiceError,
  validateEnvironment
};