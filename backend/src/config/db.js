// src/config/db.js

import { MongoClient } from 'mongodb';
import * as logger from '../utils/logger.js';

const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 15,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  compressors: 'snappy,zlib',
  zlibCompressionLevel: 7
};

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // ✅ Validation des variables d'environnement
  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    logger.error('Les variables d\'environnement MONGODB_URI et DB_NAME doivent être définies.');
    process.exit(1);
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, clientOptions);

    await client.connect();
    const db = client.db(process.env.DB_NAME);

    // 🔄 Gestion des événements de connexion
    client.on('serverDescriptionChanged', event => {
      logger.info(`MongoDB topology change: ${JSON.stringify(event)}`);
    });

    cachedClient = client;
    cachedDb = db;

    logger.info('Connexion à MongoDB réussie.');
    return { client, db };
  } catch (error) {
    logger.error('Erreur lors de la connexion à MongoDB :', error.message);
    process.exit(1);
  }
}