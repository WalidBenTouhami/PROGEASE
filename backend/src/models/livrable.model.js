const mongoose = require('mongoose');
const { Schema } = mongoose;

const livrableSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du livrable est requis.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
    },
    dateLimite: {
        type: Date,
        required: [true, 'La date limite est requise.'],
        validate: {
            validator: function(v) {
                // Permet les dates futures et la date d'aujourd'hui
                return v >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'La date limite doit être aujourd\'hui ou dans le futur.',
        },
    },
    urlDepot: {
        type: String,
        required: true,
        validate: {
            validator: (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(url),
            message: 'URL du dépôt GitHub invalide.',
        },
    },
    statut: {
        type: String,
        enum: ['En retard', 'En attente', 'Terminé'],
        default: 'En attente',
    },
    projetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projet',
        required: true,
    },
    creeLe: {
        type: Date,
        default: Date.now,
    },
    majLe: {
        type: Date,
        default: Date.now,
    },
});

// Middleware pour mettre à jour la date de modification
livrableSchema.pre('save', function(next) {
    this.majLe = new Date();
    next();
});

module.exports = mongoose.model('Livrable', livrableSchema);