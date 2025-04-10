// src/core/db.js
require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
const { MongoClient, ServerApiVersion } = require('mongodb');

// Validation de la configuration
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI manquant dans les variables d\'environnement');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
  ssl: true,
  tlsAllowInvalidCertificates: process.env.NODE_ENV === 'development',
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 30000,
};

let client;
let isConnected = false;

/**
 * Établit une connexion sécurisée à MongoDB avec gestion de reconnexion
 * @returns {Promise<MongoClient>}
 */
async function connectToDatabase() {
  if (isConnected && client) return client;

  try {
    client = new MongoClient(uri, options);

    // Connexion avec timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de connexion MongoDB')), 5000)
      )
    ]);

    // Configuration des listeners
    client.on('serverClosed', () => {
      isConnected = false;
      console.warn('Connexion MongoDB fermée par le serveur');
    });

    client.on('topologyClosed', () => {
      isConnected = false;
      console.warn('Topologie MongoDB fermée');
    });

    isConnected = true;
    console.log('✅ Connexion MongoDB établie avec succès');
    return client;

  } catch (error) {
    console.error('❌ Échec de la connexion MongoDB:', error.message);
    await closeDatabase();
    throw error;
  }
}

/**
 * Ferme proprement la connexion
 */
async function closeDatabase() {
  try {
    if (client && isConnected) {
      await client.close(true);
      console.log('🔌 Connexion MongoDB fermée intentionnellement');
    }
    isConnected = false;
  } catch (error) {
    console.error('⚠️ Erreur lors de la fermeture MongoDB:', error.message);
  }
}

/**
 * Vérifie l'état de la connexion
 */
async function checkConnection() {
  try {
    if (!client || !isConnected) return false;
    await client.db().admin().ping();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  connectToDatabase,
  closeDatabase,
  checkConnection,
  getClient: () => client,
};