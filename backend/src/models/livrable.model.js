/**
 * Modèle Mongoose optimisé pour les livrables
 * @module models/livrable
 * @version 2.0.0
 * @updated 2025-05-27
 * @author WalidBenTouhami
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
        required: [true, 'La date limite du livrable est requise'],
        validate: {
            validator: function(value) {
                return value instanceof Date && !isNaN(value);
            },
            message: 'La date limite doit être une date valide'
        }
    },
    urlDepot: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function(v) {
                // Ignorer les champs vides
                if (!v || v.length === 0) return true;

                // Validation pour les URL
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                return urlPattern.test(v);
            },
            message: props => `${props.value} n'est pas une URL valide`
        }
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
    commentaires: [{
        texte: {
            type: String,
            required: true,
            trim: true
        },
        auteur: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
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
    versionKey: 'version'
});

// Indexes pour améliorer les performances
livrableSchema.index({ projetId: 1 });
livrableSchema.index({ statut: 1 });
livrableSchema.index({ dateLimite: 1 });
livrableSchema.index({ creeLe: -1 });
livrableSchema.index({ 'commentaires.date': -1 });

/**
 * Méthode statique pour trouver les livrables par projet
 * @param {ObjectId} projetId - ID du projet
 * @returns {Promise<Array>} Liste des livrables du projet triés par date limite
 */
livrableSchema.statics.findByProjetId = function(projetId) {
    return this.find({ projetId }).sort({ dateLimite: 1 });
};

/**
 * Méthode statique pour trouver les livrables en retard
 * @returns {Promise<Array>} Liste des livrables en retard
 */
livrableSchema.statics.findEnRetard = function() {
    return this.find({
        dateLimite: { $lt: new Date() },
        statut: { $nin: [STATUTS_LIVRABLE.TERMINE, STATUTS_LIVRABLE.VALIDE] }
    }).sort({ dateLimite: 1 });
};

/**
 * Vérifie si le livrable est en retard
 * @returns {boolean} True si le livrable est en retard
 */
livrableSchema.methods.isEnRetard = function() {
    return new Date() > this.dateLimite &&
        this.statut !== STATUTS_LIVRABLE.TERMINE &&
        this.statut !== STATUTS_LIVRABLE.VALIDE;
};

/**
 * Ajoute un commentaire au livrable
 * @param {string} texte - Texte du commentaire
 * @param {ObjectId} auteurId - ID de l'utilisateur auteur
 * @returns {Object} Le commentaire ajouté
 */
livrableSchema.methods.addCommentaire = function(texte, auteurId) {
    const commentaire = {
        texte,
        auteur: auteurId,
        date: new Date()
    };
    this.commentaires.push(commentaire);
    return commentaire;
};

/**
 * Middleware: Vérification de la cohérence avec le projet parent
 */
livrableSchema.pre('validate', async function(next) {
    try {
        if (this.isNew || this.isModified('dateLimite') || this.isModified('projetId')) {
            const Projet = mongoose.model('Projet');
            const projet = await Projet.findById(this.projetId);

            if (!projet) {
                return next(new Error("Le projet associé n'existe pas"));
            }

            // Vérifier que la date limite est cohérente avec les dates du projet
            if (this.dateLimite > projet.dateFin) {
                this.invalidate('dateLimite', 'La date limite ne peut pas être postérieure à la date de fin du projet');
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Middleware: Mise à jour du projet parent lors d'un changement de statut
 */
livrableSchema.pre('save', async function(next) {
    // Si le statut a changé
    if (this.isModified('statut')) {
        try {
            // Mettre à jour la date de dernière modification
            this.majLe = new Date();

            // Si tous les livrables sont terminés ou validés, mettre à jour le statut du projet
            if (this.statut === STATUTS_LIVRABLE.VALIDE) {
                const Projet = mongoose.model('Projet');
                const Livrable = mongoose.model('Livrable');

                // Compter les livrables du projet
                const totalLivrables = await Livrable.countDocuments({
                    projetId: this.projetId
                });

                // Compter les livrables validés
                const livrablesValides = await Livrable.countDocuments({
                    projetId: this.projetId,
                    statut: STATUTS_LIVRABLE.VALIDE
                });

                // Si tous les livrables sont validés
                if (totalLivrables > 0 && totalLivrables === livrablesValides) {
                    await Projet.findByIdAndUpdate(
                        this.projetId,
                        {
                            statut: 'TERMINE',
                            majLe: new Date(),
                            majPar: this.majPar
                        }
                    );
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

/**
 * Middleware pre-save pour mettre à jour majLe
 * Note: Ce middleware est redondant avec l'option timestamps, mais est conservé
 * pour garantir la compatibilité avec le code existant.
 */
livrableSchema.pre('save', function(next) {
    this.majLe = Date.now();
    next();
});

// Créer et exporter le modèle Livrable
module.exports = mongoose.model('Livrable', livrableSchema);