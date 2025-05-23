// src/models/projet.model.js
    const mongoose = require('mongoose');
    const { Schema } = mongoose;

    const projetSchema = new Schema({
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
            validate: {
                validator: function(value) {
                    return value > this.dateDebut;
                },
                message: 'La date de fin doit être postérieure à la date de début.'
            }
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

    // Définir les index après avoir créé le schéma
    projetSchema.index({ titre: 1 });
    projetSchema.index({ statut: 1 });
    projetSchema.index({ creeLe: -1 });
    projetSchema.index({ statut: 1, creeLe: -1 });


    // Middleware pour mettre à jour automatiquement majLe
    projetSchema.pre('save', function(next) {
        this.majLe = new Date();
        next();
    });

    // Middleware pour mettre à jour majLe lors des mises à jour
    projetSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
        this.set({ majLe: new Date() });
        next();
    });

    module.exports = mongoose.model('Projet', projetSchema);