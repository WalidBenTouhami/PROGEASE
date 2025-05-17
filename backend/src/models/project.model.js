const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du projet est requis.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'La description du projet est requise.'],
        trim: true,
    },
    equipe: {
        type: [Schema.Types.ObjectId],
        ref: 'Utilisateur',
        default: [],
    },
    tuteur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
    },
    competences: {
        type: [String],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Le projet doit comporter au moins une compétence.',
        },
    },
    dateDebut: {
        type: Date,
        required: [true, 'La date de début est requise.'],
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin est requise.'],
    },
    livrables: [{
        type: Schema.Types.ObjectId,
        ref: 'Livrable',
    }],
    statut: {
        type: String,
        enum: ['Brouillon', 'En cours', 'Terminé', 'Archivé'],
        default: 'Brouillon',
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

module.exports = mongoose.model('Projet', projectSchema);