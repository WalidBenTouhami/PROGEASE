const mongoose = require('mongoose');
const { Schema } = mongoose;

const livrableSchema = new Schema({
    intitule: {
        type: String,
        required: [true, 'Le intitule du livrable est requis.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
    },
    dateEcheance: {
        type: Date,
        required: [true, 'La date limite est requise.'],
        validate: {
            validator: function(v) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return new Date(v) >= today;
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