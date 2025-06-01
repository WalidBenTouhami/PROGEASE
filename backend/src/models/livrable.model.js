const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enums } = require('../../config/constants');

const livrableSchema = new Schema({
    intitule: {
        type: String,
        required: [true, 'L\'intitulé du livrable est requis.'],
        trim: true,
        minlength: [5, 'L\'intitulé doit contenir au moins 5 caractères.'],
        maxlength: [100, 'L\'intitulé ne peut pas dépasser 100 caractères.']
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères.']
    },
    type: {
        type: String,
        required: [true, 'Le type de livrable est requis.'],
        enum: {
            values: Object.values(Enums.TypeLivrable),
            message: 'Type de livrable invalide'
        }
    },
    projetId: {
        type: Schema.Types.ObjectId,
        ref: 'Projet',
        required: [true, 'Le projet associé est requis.'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} n'est pas un ID projet valide!`
        }
    },
    dateLimite: {
        type: Date,
        required: [true, 'La date limite est requise.'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Format de date limite invalide.'
        }
    },
    statut: {
        type: String,
        required: true,
        enum: {
            values: Object.values(Enums.StatutLivrable),
            message: 'Statut de livrable invalide'
        },
        default: Enums.StatutLivrable.A_FAIRE
    },
    urlDepot: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} n'est pas une URL valide!`
        }
    },
    fichiers: [{
        nom: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        taille: {
            type: Number,
            required: true
        },
        dateUpload: {
            type: Date,
            default: Date.now
        }
    }],
    commentaires: [{
        auteur: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            required: true
        },
        contenu: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, 'Le commentaire doit contenir au moins 2 caractères.']
        },
        dateCreation: {
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
    }
}, {
    timestamps: { createdAt: 'creeLe', updatedAt: 'majLe' }
});

// Indexes
livrableSchema.index({ projetId: 1 });
livrableSchema.index({ statut: 1 });
livrableSchema.index({ dateLimite: 1 });
livrableSchema.index({ type: 1 });
livrableSchema.index({ 'commentaires.auteur': 1 });

// Virtual pour vérifier si le livrable est en retard
livrableSchema.virtual('estEnRetard').get(function() {
    if (!this.dateLimite) return false;
    if (this.statut === Enums.StatutLivrable.TERMINE) return false;
    return new Date() > this.dateLimite;
});

// Virtual pour le nombre de commentaires
livrableSchema.virtual('nombreCommentaires').get(function() {
    return this.commentaires ? this.commentaires.length : 0;
});

// Virtual pour le nombre de fichiers
livrableSchema.virtual('nombreFichiers').get(function() {
    return this.fichiers ? this.fichiers.length : 0;
});

// Pre-save middleware
livrableSchema.pre('save', function(next) {
    this.majLe = new Date();
    next();
});

// Pre-update middleware
livrableSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ majLe: new Date() });
    next();
});

module.exports = mongoose.model('Livrable', livrableSchema);