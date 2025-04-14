// src/core/db.js

import mongoose from 'mongoose';
import * as logger from '../utils/logger.js';

// ✅ Options de connexion à MongoDB
const connectionOptions = {
    maxPoolSize: 15,
    minPoolSize: 5,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority'
};

let connection = null;

export async function connectToDatabase(config = {}) {
    // ✅ Validation de la variable d'environnement
    if (!process.env.MONGODB_URI) {
        logger.error('La variable d\'environnement MONGODB_URI doit être définie.');
        process.exit(1);
    }

    if (connection) return connection;

    try {
        // 🔌 Établir une connexion à MongoDB
        connection = await mongoose.createConnection(process.env.MONGODB_URI, {
            ...connectionOptions,
            ...config
        });

        // 📌 Gestion des événements de connexion
        connection.on('connected', () =>
            logger.info('Connexion à MongoDB établie.')
        );

        connection.on('disconnected', () =>
            logger.warn('Connexion à MongoDB perdue.')
        );

        connection.on('reconnected', () =>
            logger.info('Connexion à MongoDB rétablie.')
        );

        connection.on('error', (error) =>
            logger.error(`Erreur de connexion MongoDB : ${error.message}`)
        );

        return connection;

    } catch (error) {
        logger.error(`Échec de la connexion à MongoDB : ${error.message}`);
        process.exit(1);
    }
}