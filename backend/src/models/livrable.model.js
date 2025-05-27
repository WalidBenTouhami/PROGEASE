const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const livrableSchema = new Schema({
    intitule: {
        type: String,
        required: [true, 'Le titre du livrable est requis.'],
        trim: true,
        minlength: [3, 'Le titre doit contenir au moins 3 caractères.'],
        maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères.']
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères.']
    },
    dateLimite: {
        type: Date,
        required: [true, 'La date limite est requise.'],
        validate: {
            validator: function(date) {
                return date >= new Date();
            },
            message: 'La date limite doit être ultérieure à aujourd\'hui.'
        }
    },
    projetId: {
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'L\'ID du projet est requis.'],
        index: true // Indexation pour améliorer les performances
    },
    statut: {
        type: String,
        enum: {
            values: ['en_attente', 'en_retard', 'termine'],
            message: 'Le statut doit être: en_attente, en_retard ou termine.'
        },
        default: 'en_attente',
        index: true // Indexation pour améliorer les performances
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ajout d'un index composé pour les requêtes fréquentes
livrableSchema.index({ projetId: 1, statut: 1 });

// Méthode pour vérifier si un livrable est en retard
livrableSchema.methods.estEnRetard = function() {
    return this.statut !== 'termine' && new Date() > this.dateLimite;
};

// Virtual pour accéder au projet
livrableSchema.virtual('projet', {
    ref: 'Projet',
    localField: 'projetId',
    foreignField: '_id',
    justOne: true
});

// Middleware pre-save pour mettre à jour le statut si nécessaire
livrableSchema.pre('save', function(next) {
    if (this.isModified('dateLimite') || this.isModified('statut')) {
        if (this.statut !== 'termine' && new Date() > this.dateLimite) {
            this.statut = 'en_retard';
        }
    }
    next();
});

module.exports = model('Livrable', livrableSchema);