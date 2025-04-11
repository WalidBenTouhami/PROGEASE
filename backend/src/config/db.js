// 📁 src/config/mongodb.js
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI manquant dans le fichier .env");
}

// 🔄 Singleton MongoClient
let client;

const connectToDatabase = async () => {
  if (client) return client;

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    console.log("✅ Connexion réussie à MongoDB Atlas");
    return client;
  } catch (error) {
    console.error("❌ Échec de connexion MongoDB :", error.message);
    process.exit(1); // Stoppe l'app si la BDD est inaccessible
  }
};

/**
 * 📦 Obtenir une instance de base de données
 * @param {string} dbName - PROGEASE
 */
const getDatabase = async (dbName) => {
  const client = await connectToDatabase();
  return client.db(dbName);
};

module.exports = {
  connectToDatabase,
  getDatabase
};
