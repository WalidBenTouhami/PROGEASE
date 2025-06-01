// src/middleware/errorHandlers.js
const logger = require('../utils/logger');

// Messages d'erreur standardises
const ERROR_MESSAGES = {
    STARTUP_ERROR: (msg) => `Erreur au démarrage du serveur: ${msg}`,
    FATAL_ERROR: (msg) => `Erreur fatale: ${msg}`,
    NOT_FOUND: 'Resource non trouvée'
};

/**
 * Configuration des gestionnaires d'erreurs au niveau du processus
 */
const setupProcessErrorHandlers = () => {
    // Gestion des exceptions non capturees
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });

    // Gestion des rejets de promesses non geres
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
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
};

/**
 * Configuration des gestionnaires d'erreurs au niveau HTTP
 * @param {Object} server - Serveur HTTP à configurer
 * @param {number} port - Port d'ecoute du serveur
 */
const setupHttpErrorHandlers = (server, port) => {
    // Gestion des erreurs d'ecoute du serveur
    server.on('error', (error) => {
        if (error.syscall !== 'listen') throw error;

        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
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
};

/**
 * Middleware pour gerer les ressources non trouvees (404)
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction suivante
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: ERROR_MESSAGES.NOT_FOUND
    });
};

/**
 * Middleware pour gerer les erreurs (500)
 * @param {Object} err - Erreur capturee
 * @param {Object} req - Requete Express
 * @param {Object} res - Reponse Express
 * @param {Function} next - Fonction suivante
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Erreur:', err);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Erreur interne du serveur'
    });
};

module.exports = {
    ERROR_MESSAGES,
    setupProcessErrorHandlers,
    setupHttpErrorHandlers,
    notFoundHandler,
    errorHandler
};