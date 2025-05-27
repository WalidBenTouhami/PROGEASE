// src/middleware/errorHandlers.js
const logger = require('../utils/logger');

// Messages d'erreur standardisés
const ERROR_MESSAGES = {
  STARTUP_ERROR: (message) => `Erreur lors du démarrage du serveur: ${message}`,
  SHUTDOWN_ERROR: (message) => `Erreur lors de l'arrêt du serveur: ${message}`,
  UNCAUGHT_EXCEPTION: (message) => `Exception non gérée: ${message}`,
  UNHANDLED_REJECTION: (message) => `Promise rejection non gérée: ${message}`,
  FATAL_ERROR: (message) => `ERREUR FATALE: ${message}`,
  RESOURCE_NOT_FOUND: (resource) => `Ressource non trouvée: ${resource}`,
  VALIDATION_ERROR: (details) => `Erreur de validation: ${details}`
};

/**
 * Configuration des gestionnaires d'erreurs au niveau du processus
 */
function setupProcessErrorHandlers() {
  // Gestion des exceptions non capturées
  process.on('uncaughtException', (error) => {
    logger.error(ERROR_MESSAGES.UNCAUGHT_EXCEPTION(error.message), { stack: error.stack });
    // Attendre que les logs soient écrits avant de quitter
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Gestion des rejets de promesses non gérés
  process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    const errorStack = reason instanceof Error ? reason.stack : 'No stack trace';

    logger.error(ERROR_MESSAGES.UNHANDLED_REJECTION(errorMessage), {
      stack: errorStack,
      promise: `${promise}`
    });
  });

  // Gestion de l'arrêt propre du serveur
  process.on('SIGTERM', () => {
    logger.info('Signal SIGTERM reçu. Arrêt du serveur...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('Signal SIGINT reçu. Arrêt du serveur...');
    process.exit(0);
  });

  logger.info('Gestionnaires d\'erreurs du processus configurés');
}

/**
 * Configuration des gestionnaires d'erreurs au niveau HTTP
 * @param {Object} server - Serveur HTTP à configurer
 * @param {number} port - Port d'écoute du serveur
 */
function setupHttpErrorHandlers(server, port) {
  // Gestion des erreurs d'écoute du serveur
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Le port ${port} est déjà utilisé. Veuillez en choisir un autre.`);
      process.exit(1);
    } else {
      logger.error('Erreur du serveur HTTP:', error);
      throw error;
    }
  });

  // Gestion des connexions interrompues
  server.on('clientError', (error, socket) => {
    logger.warn('Erreur client HTTP:', error);

    // Ne pas laisser la connexion ouverte
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });

  logger.info('Gestionnaires d\'erreurs HTTP configurés');
}

/**
 * Middleware pour gérer les ressources non trouvées (404)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
function notFoundHandler(req, res, next) {
  logger.warn(`Ressource non trouvée: ${req.originalUrl}`);

  res.status(404).json({
    status: 'erreur',
    message: ERROR_MESSAGES.RESOURCE_NOT_FOUND(req.originalUrl),
    timestamp: req.timestamp || new Date().toISOString()
  });
}

/**
 * Middleware pour gérer les erreurs (500)
 * @param {Object} err - Erreur capturée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log détaillé en interne
  logger.error(`Erreur ${statusCode}: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    params: req.params,
    body: req.body,
    stack: err.stack,
    user: req.currentUser
  });

  // Réponse client
  res.status(statusCode).json({
    status: 'erreur',
    message: process.env.NODE_ENV === 'production'
        ? 'Erreur serveur'
        : err.message,
    timestamp: req.timestamp || new Date().toISOString()
  });
}

module.exports = {
  ERROR_MESSAGES,
  setupProcessErrorHandlers,
  setupHttpErrorHandlers,
  notFoundHandler,
  errorHandler
};