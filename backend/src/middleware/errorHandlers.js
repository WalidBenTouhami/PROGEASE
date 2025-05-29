// src/middleware/errorHandlers.js
const logger = require('../utils/logger');

// Messages d'erreur standardises
const ERROR_MESSAGES = {
  STARTUP_ERROR: (message) => `Erreur lors du demarrage du serveur: ${message}`,
  SHUTDOWN_ERROR: (message) => `Erreur lors de l'arret du serveur: ${message}`,
  UNCAUGHT_EXCEPTION: (message) => `Exception non geree: ${message}`,
  UNHANDLED_REJECTION: (message) => `Promise rejection non geree: ${message}`,
  FATAL_ERROR: (message) => `ERREUR FATALE: ${message}`,
  RESOURCE_NOT_FOUND: (resource) => `Ressource non trouvee: ${resource}`,
  VALIDATION_ERROR: (details) => `Erreur de validation: ${details}`
};

/**
 * Configuration des gestionnaires d'erreurs au niveau du processus
 */
function setupProcessErrorHandlers() {
  // Gestion des exceptions non capturees
  process.on('uncaughtException', (error) => {
    logger.error(ERROR_MESSAGES.UNCAUGHT_EXCEPTION(error.message), { stack: error.stack });
    // Attendre que les logs soient ecrits avant de quitter
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Gestion des rejets de promesses non geres
  process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    const errorStack = reason instanceof Error ? reason.stack : 'No stack trace';

    logger.error(ERROR_MESSAGES.UNHANDLED_REJECTION(errorMessage), {
      stack: errorStack,
      promise: `${promise}`
    });
  });

  // Gestion de l'arret propre du serveur
  process.on('SIGTERM', () => {
    logger.info('Signal SIGTERM reçu. Arret du serveur...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('Signal SIGINT reçu. Arret du serveur...');
    process.exit(0);
  });

  logger.info('Gestionnaires d\'erreurs du processus configures');
}

/**
 * Configuration des gestionnaires d'erreurs au niveau HTTP
 * @param {Object} server - Serveur HTTP à configurer
 * @param {number} port - Port d'ecoute du serveur
 */
function setupHttpErrorHandlers(server, port) {
  // Gestion des erreurs d'ecoute du serveur
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Le port ${port} est dejà utilise. Veuillez en choisir un autre.`);
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

  logger.info('Gestionnaires d\'erreurs HTTP configures');
}

/**
 * Middleware pour gerer les ressources non trouvees (404)
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction suivante
 */
function notFoundHandler(req, res, next) {
  logger.warn(`Ressource non trouvee: ${req.originalUrl}`);

  res.status(404).json({
    status: 'erreur',
    message: ERROR_MESSAGES.RESOURCE_NOT_FOUND(req.originalUrl),
    timestamp: req.timestamp || new Date().toISOString()
  });
}

/**
 * Middleware pour gerer les erreurs (500)
 * @param {Object} err - Erreur capturee
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction suivante
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log detaille en interne
  logger.error(`Erreur ${statusCode}: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    params: req.params,
    body: req.body,
    stack: err.stack,
    user: req.currentUser
  });

  // Reponse client
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