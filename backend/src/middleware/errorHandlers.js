// src/middleware/errorHandlers.js
const logger = require('../utils/logger');

// Constantes pour les messages d'erreur
const ERROR_MESSAGES = {
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

  // Erreurs de production
  PRODUCTION_ERROR: 'Une erreur inattendue est survenue'
};

/**
 * Attache les gestionnaires d'erreurs au niveau du processus
 */
const setupProcessErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    logger.error(ERROR_MESSAGES.UNCAUGHT_EXCEPTION(error));
    logger.error(error.stack);
  });

  process.on('unhandledRejection', (reason, _) => {
    logger.error(ERROR_MESSAGES.UNHANDLED_REJECTION(reason));
    try {
      const promiseInfo = {
        state: 'rejected',
        reason: String(reason)
      };
      logger.error(ERROR_MESSAGES.PROMISE_DETAILS(JSON.stringify(promiseInfo)));
    } catch (e) {
      logger.error(ERROR_MESSAGES.SERIALIZATION_FAILED);
    }
  });
};

/**
 * Configure les gestionnaires d'erreurs pour le serveur HTTP
 * @param {http.Server} httpServer - Instance du serveur HTTP
 * @param {number} port - Numéro du port du serveur
 */
const setupHttpErrorHandlers = (httpServer, port) => {
  httpServer.on('error', (error) => {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const timestamp = new Date().toISOString();
    const errorMessage = error.message || 'Erreur inconnue';

    if (errorCode === 'EADDRINUSE') {
      logger.error(ERROR_MESSAGES.PORT_IN_USE(port));
    } else {
      logger.error(ERROR_MESSAGES.HTTP_SERVER_ERROR(errorMessage, errorCode));
    }

    logger.error(ERROR_MESSAGES.ERROR_TIMESTAMP(timestamp));
  });
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFoundHandler = (req, res, _next) => {
  const message = ERROR_MESSAGES.ROUTE_NOT_FOUND(req.originalUrl);

  logger.warn(message, {
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    status: 'fail',
    message: message,
    timestamp: req.timestamp || new Date().toISOString()
  });
};

/**
 * Middleware pour gérer les erreurs globales
 */
const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log structuré de l'erreur
  logger.error(`${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    errorName: err.name,
    errorCode: err.code,
    stack: err.stack
  });

  // Traitement spécifique des erreurs MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = ERROR_MESSAGES.VALIDATION_ERROR(errors);
    err.statusCode = 400;
  }

  // Gestion des erreurs de doublons MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = ERROR_MESSAGES.DUPLICATE_KEY(field);
    err.statusCode = 400;
  }

  // Gestion des erreurs de cast MongoDB
  if (err.name === 'CastError') {
    err.message = ERROR_MESSAGES.CAST_ERROR(err.value);
    err.statusCode = 400;
  }

  // Réponse en production
  if (process.env.NODE_ENV === 'production') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : ERROR_MESSAGES.PRODUCTION_ERROR,
      timestamp: req.timestamp || new Date().toISOString()
    });
  }

  // Réponse en développement
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    timestamp: req.timestamp || new Date().toISOString(),
    stack: err.stack,
    error: err
  });
};

module.exports = {
  ERROR_MESSAGES,
  setupProcessErrorHandlers,
  setupHttpErrorHandlers,
  notFoundHandler,
  errorHandler
};