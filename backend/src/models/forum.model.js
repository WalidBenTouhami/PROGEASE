const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schéma pour les réponses
const reponseSchema = new Schema({
    contenu: {
        type: String,
        required: [true, 'Le contenu de la réponse est requis'],
        minlength: [10, 'La réponse doit contenir au moins 10 caractères'],
        maxlength: [2000, 'La réponse ne peut pas dépasser 2000 caractères']
    },
    auteur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    votes: {
        positifs: [{
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }],
        negatifs: [{
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }]
    },
    estSolution: {
        type: Boolean,
        default: false
    },
    creeLe: {
        type: Date,
        default: Date.now
    },
    majLe: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    }
});

// Schéma pour les sujets
const sujetSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du sujet est requis'],
        minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    contenu: {
        type: String,
        required: [true, 'Le contenu du sujet est requis'],
        minlength: [20, 'Le contenu doit contenir au moins 20 caractères'],
        maxlength: [5000, 'Le contenu ne peut pas dépasser 5000 caractères']
    },
    auteur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    categorie: {
        type: String,
        required: [true, 'La catégorie est requise'],
        enum: ['GENERAL', 'TECHNIQUE', 'PROJET', 'FORMATION', 'AIDE', 'AUTRE']
    },
    tags: [{
        type: String,
        minlength: [2, 'Le tag doit contenir au moins 2 caractères'],
        maxlength: [20, 'Le tag ne peut pas dépasser 20 caractères']
    }],
    estResolu: {
        type: Boolean,
        default: false
    },
    vues: {
        type: Number,
        default: 0
    },
    votes: {
        positifs: [{
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }],
        negatifs: [{
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur'
        }]
    },
    reponses: [reponseSchema],
    creeLe: {
        type: Date,
        default: Date.now
    },
    majLe: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'creeLe',
        updatedAt: 'majLe'
    }
});

// Index pour optimiser les recherches
sujetSchema.index({ titre: 'text', contenu: 'text' });
sujetSchema.index({ categorie: 1 });
sujetSchema.index({ tags: 1 });
sujetSchema.index({ creeLe: -1 });

// Méthode pour incrémenter les vues
sujetSchema.methods.incrementerVues = function() {
    this.vues += 1;
    return this.save();
};

// Méthode pour marquer comme résolu
sujetSchema.methods.marquerCommeResolu = function(reponseId) {
    const reponse = this.reponses.id(reponseId);
    if (reponse) {
        reponse.estSolution = true;
        this.estResolu = true;
        return this.save();
    }
    return Promise.reject(new Error('Réponse non trouvée'));
};

// Middleware pre-save pour mettre à jour majLe
sujetSchema.pre('save', function(next) {
    this.majLe = new Date();
    next();
});

const Sujet = mongoose.model('Sujet', sujetSchema);

module.exports = {
    Sujet
};
