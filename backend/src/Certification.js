const mongoose = require('mongoose');

// Definir le schema pour "Certificat"
const certificatSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: String,
    conditions: {
        formationsRequises: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Formation',
                required: true,
            },
        ],
        scoreMinimum: { type: Number, default: 80 },
    },
    dureeValidite: { type: Number, required: true },
    dateemission: { type: Date, default: Date.now },
    utilisateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur', // Assurez-vous que le modèle utilisateur existe
        required: true,
    },
});

// Creer et exporter le modèle "Certificat"
module.exports = mongoose.model('Certificat', certificatSchema);
