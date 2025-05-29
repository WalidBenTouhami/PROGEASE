const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { Enum } = require('../../config/constants');


const livrableSchema = new Schema({
    intitule: {
        type: String,
        required: [true, 'Le titre du livrable est requis.'],
        trim: true,
        minlength: [3, 'Le titre doit contenir au moins 3 caracteres.'],
        maxlength: [150, 'Le titre ne peut pas depasser 150 caracteres.']
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caracteres.']
    },
    dateLimite: {
        type: Date,
        required: [true, 'La date limite est requise.'],
        validate: {
            validator: function(date) {
                return date >= new Date();
            },
            message: 'La date limite doit etre ulterieure à aujourd\'hui.'
        }
    },
    projetId: {
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'L\'ID du projet est requis.'],
        index: true // Indexation pour ameliorer les performances
    },
        statut: {
            type: String,
            enum: {
                values: Object.values(Enum.StatutLivrable),
                message: `Le statut doit etre l'un des suivants: ${Object.values(Enum.StatutLivrable).join(', ')}`
            },
            default: Enum.StatutLivrable.EN_ATTENTE,
            index: true
        },
    },
     {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ajout d'un index compose pour les requetes frequentes
livrableSchema.index({ projetId: 1, statut: 1 });

// Methode pour verifier si un livrable est en retard
livrableSchema.methods.estEnRetard = function() {
    return this.statut !== 'termine' && new Date() > this.dateLimite;
};

// Virtual pour acceder au projet
livrableSchema.virtual('projet', {
    ref: 'Projet',
    localField: 'projetId',
    foreignField: '_id',
    justOne: true
});

// Middleware "pre_save" pour mettre à jour le statut si necessaire
livrableSchema.pre('save', function(next) {
    if (this.isModified('dateLimite') || this.isModified('statut')) {
        if (this.statut !== 'termine' && new Date() > this.dateLimite) {
            this.statut = 'en_retard';
        }
    }
    next();
});

module.exports = model('Livrable', livrableSchema);