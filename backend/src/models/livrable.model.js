/**
 * Modèle Mongoose pour les livrables
 * @module models/livrable
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { STATUTS_LIVRABLE } = require('../../config/constants');

// Utiliser les statuts depuis constants.js
const statutsLivrableArray = Object.values(STATUTS_LIVRABLE);

const livrableSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du livrable est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères']
    },
    dateLimite: {
        type: Date,
        required: [true, 'La date limite du livrable est requise']
    },
    urlDepot: {
        type: String,
        trim: true,
        default: ''
    },
    statut: {
        type: String,
        enum: {
            values: statutsLivrableArray,
            message: `Le statut doit être l'un des suivants: ${statutsLivrableArray.join(', ')}`
        },
        default: STATUTS_LIVRABLE.EN_ATTENTE
    },
    projetId: {
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'L\'ID du projet est requis']
    },
    creeLe: {
        type: Date,
        default: Date.now
    },
    majLe: {
        type: Date,
        default: Date.now
    },
    createur: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    majPar: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Middleware pre-save pour mettre à jour majLe
livrableSchema.pre('save', function(next) {
    this.majLe = Date.now();
    next();
});

module.exports = mongoose.model('Livrable', livrableSchema);