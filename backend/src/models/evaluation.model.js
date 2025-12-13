const mongoose = require('mongoose');
const { Schema } = mongoose;

const criteriaSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du critère est requis.'],
    },
    note: {
        type: Number,
        required: [true, 'La note est requise.'],
        min: [0, 'La note ne peut pas être inférieure à 0.'],
        max: [20, 'La note ne peut pas être supérieure à 20.'],
    },
    poids: {
        type: Number,
        required: [true, 'Le poids est requis.'],
        min: [0, 'Le poids ne peut pas être inférieur à 0.'],
        max: [1, 'Le poids ne peut pas être supérieur à 1.'],
    },
});

const evaluationSchema = new Schema(
    {
        projetId: {
            type: Schema.Types.ObjectId,
            ref: 'Projet',
            required: [true, 'L\'ID du projet est requis.'],
        },
        evaluateurId: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            required: [true, 'L\'ID de l\'évaluateur est requis.'],
        },
        note: {
            type: Number,
            required: [true, 'La note est requise.'],
            min: [0, 'La note ne peut pas être inférieure à 0.'],
            max: [20, 'La note ne peut pas être supérieure à 20.'],
        },
        commentaire: {
            type: String,
            trim: true,
        },
        criteres: [criteriaSchema],
        dateEvaluation: {
            type: Date,
            default: Date.now,
        },
        creeLe: {
            type: Date,
            default: Date.now,
        },
        majLe: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: 'creeLe', updatedAt: 'majLe' },
    }
);

// Add indexes for faster queries
evaluationSchema.index({ projetId: 1 });
evaluationSchema.index({ evaluateurId: 1 });
evaluationSchema.index({ dateEvaluation: -1 });

// Pre-save middleware to update majLe
evaluationSchema.pre('save', function (next) {
    this.majLe = new Date();
    next();
});

// Pre-update middleware
evaluationSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ majLe: new Date() });
    next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
