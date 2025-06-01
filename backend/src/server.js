const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// Démarrer le serveur
const server = app.listen(config.port, () => {
    logger.info(`Serveur démarré sur le port ${config.port}`);
    logger.info(`Mode: ${config.nodeEnv}`);
    logger.info(`GraphQL Playground: http://localhost:${config.port}/graphql`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    logger.error('Erreur non capturée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Promesse rejetée non gérée:', error);
    process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
    logger.info('Signal SIGTERM reçu. Arrêt du serveur...');
    server.close(() => {
        logger.info('Serveur arrêté');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('Signal SIGINT reçu. Arrêt du serveur...');
    server.close(() => {
        logger.info('Serveur arrêté');
        process.exit(0);
    });
}); 