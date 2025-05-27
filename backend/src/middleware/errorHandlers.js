/**
 * Gestionnaires d'erreurs centralisés pour l'application
 * @module middleware/errorHandlers
 */

'use strict';

const logger = require('../utils/logger');
const { isDev } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');

/**
 * Classe d'erreur personnalisée pour les erreurs opérationnelles
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  cause;
  ctx;
  message;
  name;
  stack;

  /**
   * Crée une nouvelle instance d'AppError
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP de l'erreur
   * @param {string} [errorCode] - Code d'erreur métier (pour l'API)
   * @param {boolean} [isOperational=true] - Si l'erreur est opérationnelle
   */
  constructor(message, statusCode, errorCode = '', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode || `ERR_${statusCode}`;
    this.isOperational = isOperational;

    // Capture de la stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  actual() {
  }

  expected() {
  }

  showDiff() {
  }
}

/**
 * Énumération des messages d'erreur standardisés
 * @readonly
 * @enum {Function}
 */
const ERROR_MESSAGES = Object.freeze({
  // Messages génériques
  UNCAUGHT_EXCEPTION: (error) => `Exception non capturée: ${error.message}`,
  UNHANDLED_REJECTION: (reason) => `Promesse rejetée non gérée: ${reason}`,
  PROMISE_DETAILS: (info) => `Détails de la promesse: ${info}`,
  SERIALIZATION_FAILED: 'Impossible de sérialiser les détails de la promesse',
  ROUTE_NOT_FOUND: (url) => `Route non trouvée: ${url}`,
  SERVER_ERROR: (msg) => `Erreur serveur: ${msg}`,
  STARTUP_ERROR: (msg) => `Erreur de démarrage du serveur: ${msg}`,
  PORT_IN_USE: (port) => `Le port ${port} est déjà utilisé par une autre application`,
  HTTP_SERVER_ERROR: (msg, code) => `Erreur du serveur HTTP: ${msg} (Code: ${code})`,
  ERROR_TIMESTAMP: (time) => `Horodatage de l'erreur: ${time}`,
  FATAL_ERROR: (msg) => `Erreur fatale: ${msg}`,

  // Erreurs MongoDB spécifiques
  VALIDATION_ERROR: (errors) => `Données invalides. ${errors.join('. ')}`,
  DUPLICATE_KEY: (field) => `Valeur en doublon pour ${field}. Veuillez utiliser une autre valeur`,
  CAST_ERROR: (value) => `ID invalide: ${value}`,
  MONGO_CONNECTION: (msg) => `Erreur de connexion MongoDB: ${msg}`,
  MONGO_TIMEOUT: 'La requête MongoDB a dépassé le délai d\'attente',

  // Erreurs Apollo/GraphQL
  GRAPHQL_VALIDATION: (errors) => `Erreur de validation GraphQL: ${errors}`,
  GRAPHQL_EXECUTION: (msg) => `Erreur d'exécution GraphQL: ${msg}`,

  // Erreurs de production
  PRODUCTION_ERROR: 'Une erreur inattendue est survenue. Notre équipe technique a été notifiée.'
});

/**
 * Mapping des codes d'erreur HTTP aux messages standards
 * @readonly
 * @enum {string}
 */
const HTTP_STATUS_TEXT = Object.freeze({
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
});

/**
 * Mapping des codes d'erreur métier structurés
 * @readonly
 * @enum {string}
 */
const ERROR_CODES = Object.freeze({
  VALIDATION: 'ERR_VALIDATION',
  NOT_FOUND: 'ERR_NOT_FOUND',
  DUPLICATE: 'ERR_DUPLICATE',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  FORBIDDEN: 'ERR_FORBIDDEN',
  SERVER_ERROR: 'ERR_SERVER',
  DATABASE: 'ERR_DATABASE',
  TIMEOUT: 'ERR_TIMEOUT',
  BAD_REQUEST: 'ERR_BAD_REQUEST',
  GRAPHQL: 'ERR_GRAPHQL'
});

/**
 * Attache les gestionnaires d'erreurs au niveau du processus
 */
function setupProcessErrorHandlers() {
  process.on('uncaughtException', (error) => {
    const errorId = uuidv4();
    logger.error(`[${errorId}] ${ERROR_MESSAGES.UNCAUGHT_EXCEPTION(error)}`);
    logger.error(error.stack);

    // En production, redémarrer proprement le processus après un délai
    if (!isDev()) {
      console.error(`[${errorId}] Exception non capturée fatale. Redémarrage dans 1 seconde.`);
      setTimeout(() => process.exit(1), 1000);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    const errorId = uuidv4();
    logger.error(`[${errorId}] ${ERROR_MESSAGES.UNHANDLED_REJECTION(reason)}`);

    try {
      const promiseInfo = {
        state: 'rejected',
        reason: reason instanceof Error ? reason.message : String(reason)
      };
      logger.error(`[${errorId}] ${ERROR_MESSAGES.PROMISE_DETAILS(JSON.stringify(promiseInfo))}`);

      // En mode dev, affichons la pile d'appel si disponible
      if (isDev() && reason instanceof Error) {
        logger.error(reason.stack);
      }
    } catch (e) {
      logger.error(`[${errorId}] ${ERROR_MESSAGES.SERIALIZATION_FAILED}`);
    }

    // En production, on peut terminer proprement le processus
    if (!isDev()) {
      console.error(`[${errorId}] Promesse rejetée non gérée. Redémarrage dans 1 seconde.`);
      setTimeout(() => process.exit(1), 1000);
    }
  });

  // Gestionnaire pour SIGTERM (arrêt gracieux)
  process.on('SIGTERM', () => {
    logger.info('Signal SIGTERM reçu. Fermeture gracieuse...');
    // Idéalement ici on fermerait les connexions en cours
    process.exit(0);
  });
}

/**
 * Configure les gestionnaires d'erreurs pour le serveur HTTP
 * @param {import('http').Server} httpServer - Instance du serveur HTTP
 * @param {number} port - Numéro du port du serveur
 */
function setupHttpErrorHandlers(httpServer, port) {
  httpServer.on('error', (error) => {
    const errorId = uuidv4();
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const timestamp = new Date().toISOString();
    const errorMessage = error.message || 'Erreur inconnue';

    if (errorCode === 'EADDRINUSE') {
      logger.error(`[${errorId}] ${ERROR_MESSAGES.PORT_IN_USE(port)}`);
    } else {
      logger.error(`[${errorId}] ${ERROR_MESSAGES.HTTP_SERVER_ERROR(errorMessage, errorCode)}`);
    }

    logger.error(`[${errorId}] ${ERROR_MESSAGES.ERROR_TIMESTAMP(timestamp)}`);
  });
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 * @param {import('express').Request} req - Requête Express
 * @param {import('express').Response} res - Réponse Express
 * @param {import('express').NextFunction} next - Fonction next d'Express
 */
function notFoundHandler(req, res, next) {
  // Attribuer un ID de requête si pas déjà fait
  req.requestId = req.requestId || uuidv4();

  const message = ERROR_MESSAGES.ROUTE_NOT_FOUND(req.originalUrl);

  logger.warn(`[${req.requestId}] ${message}`, {
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Vérifier si le client accepte du HTML (navigateur) ou du JSON (API)
  const acceptsHtml = req.accepts('html');

  if (acceptsHtml && !req.path.startsWith('/api') && !req.path.startsWith('/graphql')) {
    // Pour les requêtes navigateur non-API, rediriger vers une page 404 HTML
    return res.status(404).send(`
      <html lang="">
        <head><title>Page non trouvée</title></head>
        <body>
          <h1>404 - Page non trouvée</h1>
          <p>La page demandée n'existe pas.</p>
          <a href="/">Retour à l'accueil</a>
        </body>
      </html>
    `);
  }

  // Pour les requêtes API, renvoyer un JSON
  res.status(404).json({
    status: 'fail',
    code: ERROR_CODES.NOT_FOUND,
    message: message,
    requestId: req.requestId,
    timestamp: req.timestamp || new Date().toISOString()
  });
}

/**
 * Nettoie et sécurise les données sensibles d'une erreur
 * @param {Error} err - L'erreur à nettoyer
 * @returns {Object} Erreur nettoyée
 */
function sanitizeError(err) {
  const sanitized = {
    message: err.message,
    name: err.name,
    statusCode: err.statusCode
  };

  // En dev uniquement, on peut ajouter plus d'informations
  if (isDev()) {
    sanitized.stack = err.stack;

    // Ajouter d'autres propriétés utiles pour le débogage
    if (err.code) sanitized.code = err.code;
    if (err.path) sanitized.path = err.path;
    if (err.value) sanitized.value = String(err.value).substring(0, 100); // Limiter la taille
  }

  return sanitized;
}

/**
 * Middleware pour gérer les erreurs globales
 * @param {Error} err - L'erreur capturée
 * @param {import('express').Request} req - Requête Express
 * @param {import('express').Response} res - Réponse Express
 * @param {import('express').NextFunction} next - Fonction next d'Express
 */
function errorHandler(err, req, res, next) {
  // Garantir que l'erreur a une structure minimale
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Attribuer un ID de requête si pas déjà fait
  req.requestId = req.requestId || uuidv4();

  // Log structuré de l'erreur
  logger.error(`[${req.requestId}] ${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.currentUser,
    errorName: err.name,
    errorCode: err.code,
    stack: err.stack
  });

  // Traitement des erreurs MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = ERROR_MESSAGES.VALIDATION_ERROR(errors);
    err.statusCode = 400;
    err.errorCode = ERROR_CODES.VALIDATION;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = ERROR_MESSAGES.DUPLICATE_KEY(field);
    err.statusCode = 400;
    err.errorCode = ERROR_CODES.DUPLICATE;
  } else if (err.name === 'CastError') {
    err.message = ERROR_MESSAGES.CAST_ERROR(err.value);
    err.statusCode = 400;
    err.errorCode = ERROR_CODES.BAD_REQUEST;
  } else if (err.name === 'MongoTimeoutError') {
    err.message = ERROR_MESSAGES.MONGO_TIMEOUT;
    err.statusCode = 504;
    err.errorCode = ERROR_CODES.TIMEOUT;
  } else if (err.name === 'MongoNetworkError') {
    err.message = ERROR_MESSAGES.MONGO_CONNECTION(err.message);
    err.statusCode = 503;
    err.errorCode = ERROR_CODES.DATABASE;
  }
  // GraphQL errors
  else if (err.name === 'GraphQLError') {
    err.statusCode = 400;
    err.errorCode = ERROR_CODES.GRAPHQL;
  }

  // Get standard HTTP status text
  const statusText = HTTP_STATUS_TEXT[err.statusCode] || 'Error';

  // Préparation de la réponse
  const errorResponse = {
    status: err.status,
    code: err.errorCode || `ERR_${err.statusCode}`,
    message: isDev() || err.isOperational ? err.message : ERROR_MESSAGES.PRODUCTION_ERROR,
    requestId: req.requestId,
    timestamp: req.timestamp || new Date().toISOString()
  };

  // Ajouter des détails supplémentaires en mode développement
  if (isDev()) {
    errorResponse.error = sanitizeError(err);
  }

  // Définir les en-têtes HTTP pour les erreurs
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('Content-Type', 'application/json');

  // Répondre avec le code d'état et le corps JSON appropriés
  return res.status(err.statusCode).json(errorResponse);
}

/**
 * Wrapper de contrôleur pour capturer les erreurs async
 * @param {Function} fn - Fonction de contrôleur asynchrone
 * @returns {Function} Middleware Express avec gestion d'erreurs
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Formateur d'erreur GraphQL compatible avec Apollo Server
 * @param {Error} err - Erreur GraphQL
 * @returns {Object} Erreur formatée pour Apollo
 */
function formatGraphQLError(err) {
  const errorId = uuidv4();

  // Log de l'erreur GraphQL
  logger.error(`[${errorId}] Erreur GraphQL: ${err.message}`, {
    path: err.path?.join('.'),
    locations: err.locations,
    stack: err.stack,
    extensions: err.extensions
  });

  // Formatter l'erreur pour Apollo
  const formattedError = {
    message: isDev() ? err.message : ERROR_MESSAGES.PRODUCTION_ERROR,
    requestId: errorId,
    timestamp: new Date().toISOString(),
    // Garder uniquement les extensions nécessaires
    extensions: {
      code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: err.path
    }
  };

  // Ajouter des détails supplémentaires en dev
  if (isDev()) {
    formattedError.extensions.exception = {
      stacktrace: err.stack?.split('\n')
    };
  }

  return formattedError;
}

module.exports = {
  AppError,
  ERROR_MESSAGES,
  ERROR_CODES,
  HTTP_STATUS_TEXT,
  setupProcessErrorHandlers,
  setupHttpErrorHandlers,
  notFoundHandler,
  errorHandler,
  catchAsync,
  formatGraphQLError
};