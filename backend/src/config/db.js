// src/config/db.js

import { MongoClient } from 'mongodb';
import { logger } from '../utils/logger.js';

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

    return { client, db };
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}