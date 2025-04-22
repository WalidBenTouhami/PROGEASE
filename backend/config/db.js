// ./config/db.js

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connexion réussie à MongoDB !");
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB :", error);
  } finally {
      // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = connectToDatabase;
