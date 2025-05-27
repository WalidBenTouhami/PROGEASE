/**
 * Configuration et gestion de la connexion à la base de données MongoDB
 * @module config/db
 */

'use strict';

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

// Mémorisation de l'état de connexion
let connexionInitialisee = false;

/**
 * Options de connexion MongoDB optimisées
 */
const OPTIONS_MONGODB = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Délai avant échec de sélection du serveur
    connectTimeoutMS: 30000, // Délai avant échec de connexion
    socketTimeoutMS: 45000, // Délai d'inactivité avant fermeture du socket
    maxPoolSize: 10, // Taille maximum du pool de connexions
    minPoolSize: 3, // Taille minimum du pool de connexions
    heartbeatFrequencyMS: 10000, // Fréquence des pulsations de vérification
};

/**
 * Configure et établit une connexion à MongoDB
 * @param {string} [uriMongo=MONGO_URI] - URI de connexion MongoDB
 * @returns {Promise<mongoose.Connection>} Instance de connexion MongoDB
 * @throws {Error} Si la connexion échoue
 */
async function connecterBD(uriMongo = MONGO_URI) {
    // Si la connexion est déjà établie, on la retourne simplement
    if (connexionInitialisee && mongoose.connection.readyState === 1) {
        console.log('ℹ️ Réutilisation de la connexion MongoDB existante');
        return mongoose.connection;
    }

    try {
        console.log('⏳ Connexion à MongoDB en cours...');

        // Configuration des écouteurs d'événements avant la connexion
        mongoose.connection.on('connected', () => {
            console.log('✅ Connecté à MongoDB');
            connexionInitialisee = true;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 Déconnecté de MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('🔥 Erreur de connexion MongoDB:', err.message);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Reconnecté à MongoDB');
        });

        // Gestion propre de la fermeture
        process.on('SIGINT', fermerConnexion);
        process.on('SIGTERM', fermerConnexion);

        // Établissement de la connexion
        await mongoose.connect(uriMongo, OPTIONS_MONGODB);

        return mongoose.connection;
    } catch (erreur) {
        console.error('❌ Échec de connexion MongoDB:', erreur.message);

        // En mode développement, on ne quitte pas le processus pour faciliter le débogage
        if (process.env.NODE_ENV === 'production') {
            console.error('🛑 Arrêt du processus suite à l\'échec de connexion');
            process.exit(1);
        } else {
            console.warn('⚠️ Échec de connexion en mode développement - poursuite du processus');
        }

        throw erreur;
    }
}

/**
 * Ferme proprement la connexion à MongoDB
 */
async function fermerConnexion() {
    try {
        console.log('🔄 Fermeture de la connexion MongoDB...');

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('👋 Connexion MongoDB fermée proprement');
        }

        process.exit(0);
    } catch (erreur) {
        console.error('❌ Erreur lors de la fermeture de la connexion:', erreur.message);
        process.exit(1);
    }
}

module.exports = {
    connecterBD,
    fermerConnexion,
    getConnection: () => mongoose.connection
};