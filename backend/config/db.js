const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

/**
 * Connecte l'application à MongoDB
 * @param {string} uri - URI de connexion MongoDB
 * @returns {Promise<void>}
 */
async function connecterBD(uri) {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(uri, options);

        mongoose.connection.on('error', err => {
            logger.error('Erreur MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Déconnecté de MongoDB');
        });

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info("Connexion MongoDB fermée suite à l'arrêt de l'application");
                process.exit(0);
            } catch (err) {
                logger.error('Erreur lors de la fermeture de la connexion MongoDB:', err);
                process.exit(1);
            }
        });
    } catch (error) {
        logger.error('Erreur de connexion à MongoDB:', error);
        throw error;
    }
}

module.exports = connecterBD;
