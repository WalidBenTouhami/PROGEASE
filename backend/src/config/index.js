require('dotenv').config();

const config = {
  // Configuration du serveur
  serveur: {
    port: process.env.PORT || 4000,
    environnement: process.env.NODE_ENV || 'development',
    timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
    compression: process.env.ENABLE_COMPRESSION === 'true'
  },

  // Configuration de la base de données
  baseDeDonnees: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/progease',
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000
    }
  },

  // Configuration de l'authentification
  authentification: {
    secret: process.env.JWT_SECRET,
    dureeExpiration: process.env.JWT_EXPIRES_IN || '7d',
    algorithme: process.env.JWT_ALGORITHM || 'HS256',
    refreshToken: {
      dureeExpiration: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
    }
  },

  // Configuration des emails
  email: {
    hote: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    utilisateur: process.env.SMTP_USER,
    motDePasse: process.env.SMTP_PASS,
    securite: process.env.SMTP_SECURE === 'true',
    expediteur: process.env.EMAIL_FROM || 'noreply@progease.com'
  },

  // Configuration des fichiers
  fichiers: {
    repertoire: process.env.UPLOAD_DIR || 'uploads',
    tailleMaximale: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    typesAutorises: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(','),
    compression: {
      active: process.env.ENABLE_FILE_COMPRESSION === 'true',
      qualite: parseInt(process.env.COMPRESSION_QUALITY) || 80
    }
  },

  // Configuration des journaux
  journaux: {
    niveau: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    rotation: {
      active: process.env.ENABLE_LOG_ROTATION === 'true',
      tailleMaximale: process.env.MAX_LOG_SIZE || '20m',
      nombreMaximal: parseInt(process.env.MAX_LOG_FILES) || 5
    }
  },

  // Configuration CORS
  cors: {
    origine: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methodes: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // Configuration de la pagination
  pagination: {
    taillePageParDefaut: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    taillePageMaximale: parseInt(process.env.MAX_PAGE_SIZE) || 100,
    triParDefaut: process.env.DEFAULT_SORT || '-dateCreation'
  },

  // Configuration des limites de taux
  limitationTaux: {
    fenetreTemps: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    nombreMaximal: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: process.env.RATE_LIMIT_MESSAGE || 'Trop de requêtes, veuillez réessayer plus tard'
  },

  // Configuration du cache
  cache: {
    active: process.env.ENABLE_CACHE === 'true',
    duree: parseInt(process.env.CACHE_DURATION) || 3600, // 1 heure
    type: process.env.CACHE_TYPE || 'memory'
  }
};

// Vérification des configurations requises
const configurationsRequises = ['MONGODB_URI', 'JWT_SECRET'];
const configurationsManquantes = configurationsRequises.filter(cle => !process.env[cle]);

if (configurationsManquantes.length > 0) {
  throw new Error(`Configurations requises manquantes: ${configurationsManquantes.join(', ')}`);
}

module.exports = config; 