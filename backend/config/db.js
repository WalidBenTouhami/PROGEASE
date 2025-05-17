// config/db.js

const mongoose = require('mongoose');

// ✅ Connexion à MongoDB (messages en français)
async function connectToDatabase(mongoUri) {
    try {
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connecté à MongoDB');
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB :', error.message);
        process.exit(1); // Arrêt du processus si la connexion échoue
    }
}

module.exports = connectToDatabase;