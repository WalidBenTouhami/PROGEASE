const mongoose = require('mongoose');

// Connexion à MongoDB (messages en français)
async function connecterBD(uriMongo) {
    try {
        await mongoose.connect(uriMongo);
        console.log('✅ Connecté à MongoDB');
    } catch (erreur) {
        console.error('❌ Erreur de connexion MongoDB :', erreur.message);
        process.exit(1); // Arrêt du processus si la connexion échoue
    }
}

module.exports = connecterBD;