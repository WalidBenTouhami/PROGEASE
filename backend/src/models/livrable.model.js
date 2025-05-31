const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enums } = require('../../config/constants');

const livrableSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du livrable est requis.'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères.'],
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères.']
    },
    description: {
        type: String,
        required: [true, 'La description du livrable est requise.'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères.']
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
    dateEcheance: {
        type: Date,
        required: [true, 'La date d\'échéance est requise.'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Format de date d\'échéance invalide.'
        }
    },
    statut: {
        type: String,
        required: true,
        enum: {
            values: Object.values(Enums.StatutLivrable),
            message: 'Statut de livrable invalide'
        },
        default: Enums.StatutLivrable.EN_ATTENTE
    },
    urlLivrable: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} n'est pas une URL valide!`
        }
    },
    commentaires: [{
        auteur: {
            type: Schema.Types.ObjectId,
            ref: 'Utilisateur',
            required: true
        },
        contenu: {
            type: String,
            required: true,
            trim: true
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
livrableSchema.index({ dateEcheance: 1 });
livrableSchema.index({ 'commentaires.auteur': 1 });

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