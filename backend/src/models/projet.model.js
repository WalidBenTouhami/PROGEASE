/**
 * Modèle Mongoose optimisé pour les projets
 * @module models/projet
 * @version 2.0.0
 * @updated 2025-05-27
 * @author WalidBenTouhami
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
        trim: true,
        validate: {
            validator: function(value) {
                return value.length >= 2 && value.length <= 30;
            },
            message: 'Chaque compétence doit contenir entre 2 et 30 caractères'
        }
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
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    },
    // Activer le versionnement des documents
    versionKey: 'version'
});

// Indexes pour améliorer les performances
projetSchema.index({ titre: 'text', description: 'text' });
projetSchema.index({ statut: 1 });
projetSchema.index({ dateDebut: 1, dateFin: 1 });
projetSchema.index({ tuteur: 1 });
projetSchema.index({ creeLe: -1 }); // Pour trier par date de création décroissante

/**
 * Trouve les projets associés à un tuteur spécifique
 * @param {ObjectId} tuteurId - ID de l'utilisateur tuteur
 * @returns {Promise<Array>} Liste des projets triés par date de mise à jour
 */
projetSchema.statics.findByTuteur = function(tuteurId) {
    return this.find({ tuteur: tuteurId }).sort({ majLe: -1 });
};

/**
 * Trouve les projets par compétence
 * @param {string} competence - Compétence recherchée
 * @returns {Promise<Array>} Liste des projets correspondants
 */
projetSchema.statics.findByCompetence = function(competence) {
    return this.find({ competences: { $in: [competence] } }).sort({ majLe: -1 });
};

/**
 * Vérifie si le projet est actuellement actif (entre date début et fin)
 * @returns {boolean} True si le projet est actif, false sinon
 */
projetSchema.methods.isActif = function() {
    const now = new Date();
    return now >= this.dateDebut && now <= this.dateFin;
};

/**
 * Vérifie si le projet est en retard par rapport à la planification
 * @returns {boolean} True si le projet est en retard
 */
projetSchema.methods.isEnRetard = function() {
    if (this.statut === STATUTS_PROJET.TERMINE) return false;

    const now = new Date();
    const totalDuration = this.dateFin - this.dateDebut;
    const elapsedDuration = now - this.dateDebut;
    const progressPercentage = (elapsedDuration / totalDuration) * 100;

    // Si plus de 75% du temps est écoulé et statut n'est pas TERMINE ou EN_VALIDATION
    return progressPercentage > 75 &&
        ![STATUTS_PROJET.TERMINE, STATUTS_PROJET.EN_VALIDATION].includes(this.statut);
};

/**
 * Middleware: Vérification avant suppression d'un projet
 * Empêche la suppression si des livrables sont associés
 */
projetSchema.pre('remove', async function(next) {
    try {
        const Livrable = mongoose.model('Livrable');
        const count = await Livrable.countDocuments({ projetId: this._id });
        if (count > 0) {
            return next(new Error(`Ce projet contient ${count} livrable(s) et ne peut pas être supprimé. Supprimez d'abord les livrables.`));
        }
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Middleware: Mise à jour des dates avant chaque opération de sauvegarde
 * Note: Ce middleware est redondant avec l'option timestamps, mais est conservé
 * pour garantir la compatibilité avec le code existant.
 */
projetSchema.pre('save', function(next) {
    this.majLe = Date.now();
    next();
});

// Créer et exporter le modèle Projet
module.exports = mongoose.model('Projet', projetSchema);