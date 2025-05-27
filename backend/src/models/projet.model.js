/**
 * Modèle Mongoose pour les projets
 * @module models/projet
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { STATUTS_PROJET } = require('../../config/constants');

// Utiliser les statuts depuis constants.js
const statutsProjetArray = Object.values(STATUTS_PROJET);

const projetSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du projet est requis'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description du projet est requise'],
        trim: true,
        minlength: [20, 'La description doit contenir au moins 20 caractères']
    },
    equipe: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tuteur: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    competences: [{
        type: String,
        trim: true
    }],
    dateDebut: {
        type: Date,
        required: [true, 'La date de début du projet est requise']
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin du projet est requise'],
        validate: {
            validator: function(value) {
                return value > this.dateDebut;
            },
            message: 'La date de fin doit être postérieure à la date de début'
        }
    },
    livrables: [{
        type: Schema.Types.ObjectId,
        ref: 'Livrable'
    }],
    statut: {
        type: String,
        enum: {
            values: statutsProjetArray,
            message: `Le statut doit être l'un des suivants: ${statutsProjetArray.join(', ')}`
        },
        default: STATUTS_PROJET.EN_COURS
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
projetSchema.pre('save', function(next) {
    this.majLe = Date.now();
    next();
});

module.exports = mongoose.model('Projet', projetSchema);