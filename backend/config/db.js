const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Options de connexion optimisées
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // IPv4, évite les problèmes de résolution IPv6
};

/**
 * Connexion optimisée à MongoDB avec retry
 * @param {string} uriMongo - URI de connexion
 * @param {number} maxRetries - Nombre maximal de tentatives
 * @param {number} delay - Délai entre les tentatives (ms)
 */
async function connecterBD(uriMongo, maxRetries = 5, delay = 5000) {
    let retries = 0;
    let connected = false;

    while (retries < maxRetries && !connected) {
        try {
            await mongoose.connect(uriMongo, mongooseOptions);
            connected = true;
            logger.info('✅ Connecté à MongoDB');

            // Écouter les événements de connexion
            mongoose.connection.on('error', (err) => {
                logger.error('Erreur de connexion MongoDB:', err);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('Déconnecté de MongoDB');
                // Planifier une nouvelle tentative
                setTimeout(() => {
                    if (!mongoose.connection.readyState) {
                        logger.info('Tentative de reconnexion à MongoDB...');
                        connecterBD(uriMongo, 3, 10000).catch(() => {});
                    }
                }, 10000);
            });

        } catch (erreur) {
            retries++;
            const retrySuffix = retries < maxRetries ?
                `Nouvelle tentative dans ${delay/1000}s (${retries}/${maxRetries})` :
                'Nombre maximal de tentatives atteint';

            logger.error(`❌ Erreur de connexion MongoDB: ${erreur.message}. ${retrySuffix}`);

            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Échec après toutes les tentatives
                process.exit(1);
            }
        }
    }

    return mongoose.connection;
}

module.exports = connecterBD;