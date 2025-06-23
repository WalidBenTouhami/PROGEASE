require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
const logger = require('./src/utils/logger');

// Import middleware
const { versionMiddleware } = require('./src/middleware/version.middleware');
const { validateRequest, schemas } = require('./src/middleware/validation.middleware');
const { cacheMiddleware, invalidateCache } = require('./src/config/redis.config');
const { swaggerMiddleware } = require('./src/config/swagger.config');

// Import routes
const utilisateurRoutes = require('./src/routes/utilisateur.routes');

// Create Express app
const app = express();

// Configure rate limiter with stricter options
const limiteur = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use IP + User Agent as key for better rate limiting
    return `${req.ip}-${req.get('user-agent')}`;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  },
  skip: (req) => {
    // Skip rate limiting for certain paths or in development
    return config.server.env === 'development' || 
           req.path.startsWith('/api-docs') ||
           req.path.startsWith('/health');
  }
});

// Security and optimization middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.example.com', 'wss:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'", 'blob:']
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
  expectCt: {
    enforce: true,
    maxAge: 30
  },
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"]
    }
  }
}));

app.use(compression({
  level: 6,
  threshold: 100 * 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(limiteur);
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-api-version',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// MongoDB injection protection
app.use(mongoSanitize());

// XSS protection
app.use(xss());

// HTTP Parameter Pollution protection
app.use(hpp());

// Parse cookies
app.use(cookieParser());

// Parse JSON with size limit and validation
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000
}));

// API versioning
app.use(versionMiddleware({
  defaultVersion: 'v1',
  supportedVersions: ['v1', 'v2'],
  versionHeader: 'x-api-version'
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
    version: req.apiVersion
  });
  next();
});
const PORT = config.server.port || 3000; // Valeur par défaut au cas où
const ENV = config.server.env || 'development';
// Swagger documentation
app.use('/api-docs', swaggerMiddleware);

// API routes with caching
app.use('/api/utilisateurs', 
  cacheMiddleware(300), // Cache for 5 minutes
  invalidateCache(['cache:*/api/utilisateurs*']),
  utilisateurRoutes
);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  logger.error('Erreur serveur:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    version: req.apiVersion,
    timestamp: new Date().toISOString(),
    userAgent: req.get('user-agent'),
    query: req.query,
    body: req.body,
    params: req.params
  });

  // Classify error type
  let statusCode = err.status || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errorCode = 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
  }
  
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(config.server.env === 'development' && { 
        stack: err.stack,
        details: err.details 
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Send error response
  res.status(statusCode).json(errorResponse);

  // If it's a critical error, consider shutting down gracefully
  if (statusCode === 500 && !config.server.env === 'development') {
    logger.error('Critical error detected, initiating graceful shutdown');
    fermetureGraceuse();
  }
});

// MongoDB connection options
const optionsMongoDB = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  autoIndex: config.server.env === 'development',
  retryWrites: true,
  w: 'majority',
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority', wtimeout: 2500 },
  compressors: ['zlib'],
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  appName: 'progease-api'
};

// Connect to MongoDB with improved error handling
mongoose.connect(config.mongodb.uri, optionsMongoDB)
  .then(() => {
    logger.info('✅ Connexion à MongoDB établie avec succès');
    
    // Start server
    const PORT = config.server.port || config.serveur.port;
    const ENV = config.server.env || config.serveur.environnement;
    const server = app.listen(PORT, () => {
      logger.info(`✅ Serveur démarré sur le port ${PORT}`);
      logger.info(`✅ Environnement: ${ENV}`);
      logger.info(`✅ URL: http://localhost:${PORT}`);
      logger.info(`✅ API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Server error handling
    server.on('error', (error) => {
      logger.error('Erreur serveur:', error);
      process.exit(1);
    });
  })
  .catch((erreur) => {
    logger.error('❌ Échec de la connexion à MongoDB:', erreur);
    process.exit(1);
  });

// Improved graceful shutdown
const fermetureGraceuse = async () => {
  logger.info('Arrêt gracieux du serveur...');
  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('Connexion MongoDB fermée avec succès');

    // Impossible de fermer un serveur avec app.listen() ici, il faut garder une référence globale si besoin
    process.exit(0);
  } catch (erreur) {
    logger.error('Erreur lors de la fermeture:', erreur);
    process.exit(1);
  }
};

// Signal handling
process.on('SIGTERM', fermetureGraceuse);
process.on('SIGINT', fermetureGraceuse);

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée:', error);
  fermetureGraceuse().then(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse non gérée:', { reason, promise });
  fermetureGraceuse().then(() => {
    process.exit(1);
  });
});
