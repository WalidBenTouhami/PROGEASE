const createApp = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

(async () => {
    try {
        const app = await createApp();
        const server = app.listen(config.port, () => {
            logger.info(`Serveur démarré sur le port ${config.port}`);
            logger.info(`Mode: ${config.nodeEnv}`);
            logger.info(`GraphQL Playground: http://localhost:${config.port}/graphql`);
        });

        // Fonction pour arrêter proprement le serveur
        const shutdown = async () => {
            try {
                await mongoose.connection.close();
                logger.info('Connexion MongoDB fermée');
                server.close(() => {
                    logger.info('Serveur HTTP arrêté');
                    process.exit(0);
                });
            } catch (error) {
                logger.error('Erreur lors de l\'arrêt du serveur:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => {
            logger.info('Signal SIGTERM reçu. Arrêt du serveur...');
            shutdown();
        });

        process.on('SIGINT', () => {
            logger.info('Signal SIGINT reçu. Arrêt du serveur...');
            shutdown();
        });

        process.on('uncaughtException', (error) => {
            logger.error('Erreur non capturée:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (error) => {
            logger.error('Promesse rejetée non gérée:', error);
            process.exit(1);
        });
    } catch (error) {
        logger.error('Erreur lors du démarrage de l\'application:', error);
        process.exit(1);
    }
})(); 