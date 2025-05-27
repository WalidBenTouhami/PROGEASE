const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Enum } = require('../../config/constants');

const projetSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'Le titre du projet est requis.'],
        trim: true,
        minlength: [5, 'Le titre doit contenir au moins 5 caractères.'],
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères.']
    },
    description: {
        type: String,
        required: [true, 'La description du projet est requise.'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères.']
    },
    equipe: [{
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} n'est pas un ID utilisateur valide!`
        }
    }],
    tuteur: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        validate: {
            validator: function(v) {
                return v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} n'est pas un ID tuteur valide!`
        }
    },
    competences: {
        type: [String],
        validate: {
            validator: function(arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: 'Le projet doit comporter au moins une compétence.'
        }
    },
    dateDebut: {
        type: Date,
        required: [true, 'La date de début est requise.'],
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Format de date de début invalide.'
        }
    },
    dateFin: {
        type: Date,
        required: [true, 'La date de fin est requise.'],
        validate: [
            {
                validator: function(value) {
                    return value > this.dateDebut;
                },
                message: 'La date de fin doit être postérieure à la date de début.'
            },
            {
                validator: function(v) {
                    return v instanceof Date && !isNaN(v);
                },
                message: 'Format de date de fin invalide.'
            }
        ]
    },
    livrables: [{
        type: Schema.Types.ObjectId,
        ref: 'Livrable',
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} n'est pas un ID livrable valide!`
        }
    }],
    statut: {
        type: String,
        enum: {
            values: Object.values(Enum.StatutProjet),
            message: `Le statut doit être l'un des suivants: ${Object.values(Enum.StatutProjet).join(', ')}`
        },
        default: Enum.StatutProjet.BROUILLON,
        index: true
    },
    progression: {
        type: Number,
        min: [0, 'La progression ne peut pas être négative.'],
        max: [100, 'La progression ne peut pas dépasser 100%.'],
        default: 0,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    creeLe: {
        type: Date,
        default: Date.now,
    },
    majLe: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
});

// Virtuals
projetSchema.virtual('duree').get(function() {
    return Math.ceil((this.dateFin - this.dateDebut) / (1000 * 60 * 60 * 24));
});

projetSchema.virtual('estEnRetard').get(function() {
    return this.statut !== Enum.StatutProjet.TERMINE &&
        this.statut !== Enum.StatutProjet.ARCHIVE &&
        new Date() > this.dateFin;
});

// Populer les livrables virtuels
projetSchema.virtual('livrablesComplets', {
    ref: 'Livrable',
    localField: '_id',
    foreignField: 'projetId'
});

// Index optimisés
projetSchema.index({ titre: 1 });
projetSchema.index({ statut: 1 });
projetSchema.index({ creeLe: -1 });
projetSchema.index({ statut: 1, creeLe: -1 });
projetSchema.index({ equipe: 1 });
projetSchema.index({ tuteur: 1 });
projetSchema.index({ dateDebut: 1, dateFin: 1 });

// Middleware pré-sauvegarde
projetSchema.pre('save', function(next) {
    this.majLe = new Date();

    // Auto-calcul de progression si livrables présents
    if (this.isModified('livrables') && this.livrables.length > 0) {
        this.calculerProgression();
    }

    next();
});

// Middlewares pré-mise à jour
projetSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ majLe: new Date() });
    next();
});

// Méthode pour calculer la progression
projetSchema.methods.calculerProgression = async function() {
    const livrable = mongoose.model('livrable');
    const livrables = await livrable.find({ _id: { $in: this.livrables } }).lean();

    if (!livrables.length) {
        this.progression = 0;
        return;
    }

    const termines = livrables.filter(l => l.statut === 'termine').length;
    this.progression = Math.round((termines / livrables.length) * 100);
};

// Méthode statique pour recherche avancée
projetSchema.statics.rechercheAvancee = async function(criteres = {}) {
    const { titre, statut, competences, dateDebut, dateFin, page = 1, limit = 20 } = criteres;

    const query = {};

    if (titre) query.titre = new RegExp(titre, 'i');
    if (statut) query.statut = statut;
    if (competences && competences.length) query.competences = { $all: competences };

    if (dateDebut || dateFin) {
        query.dateDebut = {};
        query.dateFin = {};

        if (dateDebut) query.dateDebut.$gte = new Date(dateDebut);
        if (dateFin) query.dateFin.$lte = new Date(dateFin);
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { creeLe: -1 },
        lean: true
    };

    return this.find(query)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort)
        .lean();
};

module.exports = mongoose.model('Projet', projetSchema);