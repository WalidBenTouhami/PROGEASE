require('dotenv').config();

const config = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configuration de la base de données
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/progease'
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Configuration des emails
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  // Configuration des uploads
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },

  // Configuration des logs
  log: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Configuration CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Configuration de la pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100
  },

  // Configuration des limites de taux
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};

// Vérification des configurations requises
const requiredConfigs = ['MONGODB_URI', 'JWT_SECRET'];
const missingConfigs = requiredConfigs.filter(key => !process.env[key]);

if (missingConfigs.length > 0) {
  throw new Error(`Configuration manquante: ${missingConfigs.join(', ')}`);
}

module.exports = config; 