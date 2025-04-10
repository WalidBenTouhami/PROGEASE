require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Créer un MongoClient avec un objet MongoClientOptions pour définir la version Stable de l'API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connecter le client au serveur (optionnel à partir de v4.7)
    await client.connect();
    // Envoyer un ping pour confirmer une connexion réussie
    await client.db("Walid").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // S'assurer que le client se ferme lorsque vous avez terminé/en cas d'erreur
    await client.close();
  }
}
run().catch(console.dir);